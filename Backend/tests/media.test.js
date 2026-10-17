import { test, describe, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import {
  detectImageSignature,
  uploadSingleImage,
  ALLOWED_MIME_TYPES,
} from "../src/middlewares/upload.middleware.js";
import {
  generateUniqueFileName,
  uploadImage,
  deleteImage,
  safeCleanupFile,
} from "../src/services/imagekit.service.js";
import imagekit from "../src/config/imagekit.js";
import UserModel from "../src/models/user.model.js";
import TeamModel from "../src/models/team.model.js";
import ProjectModel from "../src/models/project.model.js";
import {
  updateProfileAvatar,
  deleteProfileAvatar,
  updateTeamLogo,
  deleteTeamLogo,
  updateProjectCover,
  deleteProjectCover,
} from "../src/controllers/media.controller.js";
import { updateUserProfile } from "../src/controllers/user.controller.js";


// Valid image binary buffers with magic numbers
const VALID_JPEG_BUFFER = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
const VALID_PNG_BUFFER = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
const VALID_WEBP_BUFFER = Buffer.from([
  0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
]);
const FAKE_TEXT_BUFFER = Buffer.from("Hello world, this is a plain text file spoofed as an image.");

describe("1. Magic Bytes & MIME-Type Validation", () => {
  test("Correctly detects valid JPEG magic numbers", () => {
    const detected = detectImageSignature(VALID_JPEG_BUFFER);
    assert.equal(detected, "image/jpeg");
  });

  test("Correctly detects valid PNG magic numbers", () => {
    const detected = detectImageSignature(VALID_PNG_BUFFER);
    assert.equal(detected, "image/png");
  });

  test("Correctly detects valid WebP magic numbers", () => {
    const detected = detectImageSignature(VALID_WEBP_BUFFER);
    assert.equal(detected, "image/webp");
  });

  test("Rejects spoofed text file masquerading as image", () => {
    const detected = detectImageSignature(FAKE_TEXT_BUFFER);
    assert.equal(detected, null);
  });

  test("Rejects null or tiny buffers (< 12 bytes)", () => {
    assert.equal(detectImageSignature(null), null);
    assert.equal(detectImageSignature(Buffer.from([0xff, 0xd8])), null);
  });
});

describe("2. ImageKit Service Unit Tests (Mocked SDK)", () => {
  let originalUpload;
  let originalDelete;

  beforeEach(() => {
    originalUpload = imagekit.files.upload;
    originalDelete = imagekit.files.delete;
  });

  test("generateUniqueFileName produces unique, sanitized filenames", () => {
    const name1 = generateUniqueFileName("profile photo (1)!.png", "avatar");
    const name2 = generateUniqueFileName("profile photo (1)!.png", "avatar");
    assert.notEqual(name1, name2);
    assert.match(name1, /^avatar_profile_photo_\S+_\d+_[a-f0-9]+\.png$/);
  });

  test("uploadImage successfully uploads buffer and formats response", async () => {
    imagekit.files.upload = async (params) => {
      assert.ok(params.file);
      assert.equal(params.folder, "/profiles");
      return {
        url: "https://ik.imagekit.io/teamsync/profiles/avatar_123.jpg",
        fileId: "ik_file_12345",
        name: "avatar_123.jpg",
        size: 2048,
        filePath: "/profiles/avatar_123.jpg",
        thumbnailUrl: "https://ik.imagekit.io/teamsync/tr:n-media_library_thumbnail/profiles/avatar_123.jpg",
      };
    };

    const result = await uploadImage({
      buffer: VALID_JPEG_BUFFER,
      originalName: "avatar.jpg",
      folder: "/profiles",
      tags: ["avatar", "test"],
    });

    assert.equal(result.fileId, "ik_file_12345");
    assert.equal(result.url, "https://ik.imagekit.io/teamsync/profiles/avatar_123.jpg");
    assert.equal(result.size, 2048);
  });

  test("uploadImage throws structured error when ImageKit SDK fails", async () => {
    imagekit.files.upload = async () => {
      const err = new Error("Network timeout connecting to ImageKit");
      err.status = 504;
      throw err;
    };

    await assert.rejects(
      async () => {
        await uploadImage({
          buffer: VALID_PNG_BUFFER,
          originalName: "test.png",
        });
      },
      (err) => {
        assert.match(err.message, /ImageKit upload failed/);
        assert.equal(err.statusCode, 504);
        return true;
      }
    );
  });

  test("deleteImage succeeds when SDK deletes file", async () => {
    let deletedId = null;
    imagekit.files.delete = async (fileId) => {
      deletedId = fileId;
    };

    const res = await deleteImage("file_to_delete_999");
    assert.equal(deletedId, "file_to_delete_999");
    assert.equal(res.success, true);
  });

  test("deleteImage is idempotent and handles 404 NotFound safely", async () => {
    imagekit.files.delete = async () => {
      const err = new Error("File not found");
      err.status = 404;
      throw err;
    };

    const res = await deleteImage("non_existent_file");
    assert.equal(res.success, true);
    assert.match(res.message, /not found/i);
  });
});

describe("3. Controller & Two-Phase Transactional Rollback Tests", () => {
  test("updateProfileAvatar: Successful avatar upload & replaces old file", async () => {
    let deletedOldFileId = null;
    imagekit.files.upload = async () => ({
      url: "https://ik.imagekit.io/teamsync/new_avatar.jpg",
      fileId: "new_file_id_111",
      name: "new_avatar.jpg",
      size: 1024,
      filePath: "/profiles/new_avatar.jpg",
    });

    imagekit.files.delete = async (fileId) => {
      deletedOldFileId = fileId;
    };

    const mockUser = {
      _id: "user_abc_123",
      name: "Test User",
      avatar: "https://ik.imagekit.io/teamsync/old_avatar.jpg",
      avatarFileId: "old_file_id_000",
      save: async () => true,
    };

    UserModel.findById = async () => mockUser;

    const req = {
      user: { _id: "user_abc_123", role: "member" },
      file: {
        buffer: VALID_JPEG_BUFFER,
        originalname: "avatar.jpg",
        mimetype: "image/jpeg",
        verifiedMimeType: "image/jpeg",
      },
    };

    let responseStatus = 0;
    let responseJson = null;

    const res = {
      status: (code) => {
        responseStatus = code;
        return {
          json: (data) => {
            responseJson = data;
          },
        };
      },
    };

    await updateProfileAvatar(req, res);

    assert.equal(responseStatus, 200);
    assert.equal(responseJson.success, true);
    assert.equal(responseJson.data.fileId, "new_file_id_111");
    assert.equal(mockUser.avatar, "https://ik.imagekit.io/teamsync/new_avatar.jpg");
    assert.equal(mockUser.avatarFileId, "new_file_id_111");
    // Assert old file was purged
    assert.equal(deletedOldFileId, "old_file_id_000");
  });

  test("updateProfileAvatar: Missing file triggers 400 Bad Request", async () => {
    const req = { user: { _id: "user_abc_123" }, file: null };
    let responseStatus = 0;
    let responseJson = null;

    const res = {
      status: (code) => {
        responseStatus = code;
        return {
          json: (data) => {
            responseJson = data;
          },
        };
      },
    };

    await updateProfileAvatar(req, res);
    assert.equal(responseStatus, 400);
    assert.equal(responseJson.success, false);
    assert.match(responseJson.message, /No image file provided/);
  });

  test("updateProfileAvatar: Nonexistent user triggers 404", async () => {
    UserModel.findById = async () => null;

    const req = {
      user: { _id: "missing_user" },
      file: { buffer: VALID_JPEG_BUFFER, originalname: "avatar.jpg", mimetype: "image/jpeg" },
    };

    let responseStatus = 0;
    const res = {
      status: (code) => {
        responseStatus = code;
        return { json: () => {} };
      },
    };

    await updateProfileAvatar(req, res);
    assert.equal(responseStatus, 404);
  });

  test("Rollback on DB Failure: cleans up newly uploaded ImageKit file when DB save throws", async () => {
    let rolledBackFileId = null;

    imagekit.files.upload = async () => ({
      url: "https://ik.imagekit.io/teamsync/orphan_avatar.jpg",
      fileId: "orphan_file_id_999",
      name: "orphan_avatar.jpg",
      size: 1024,
    });

    imagekit.files.delete = async (fileId) => {
      rolledBackFileId = fileId;
    };

    const mockUser = {
      _id: "user_abc_123",
      avatar: "old_url",
      avatarFileId: "old_id",
      save: async () => {
        throw new Error("MongoDB connection timeout / write conflict");
      },
    };

    UserModel.findById = async () => mockUser;

    const req = {
      user: { _id: "user_abc_123", role: "member" },
      file: {
        buffer: VALID_PNG_BUFFER,
        originalname: "avatar.png",
        mimetype: "image/png",
        verifiedMimeType: "image/png",
      },
    };

    let responseStatus = 0;
    let responseJson = null;

    const res = {
      status: (code) => {
        responseStatus = code;
        return {
          json: (data) => {
            responseJson = data;
          },
        };
      },
    };

    await updateProfileAvatar(req, res);

    assert.equal(responseStatus, 500);
    assert.equal(responseJson.success, false);
    // CRITICAL: Ensure the uploaded orphan was deleted from ImageKit
    assert.equal(rolledBackFileId, "orphan_file_id_999");
  });

  test("updateTeamLogo: Rejects unauthorized user (403 Forbidden)", async () => {
    const mockTeam = {
      _id: "team_111",
      name: "Core Team",
      owner: "another_user_id",
      members: [],
      canManageTeam: () => false,
    };

    TeamModel.findById = async () => mockTeam;

    const req = {
      params: { teamId: "507f1f77bcf86cd799439011" },
      user: { _id: "unauthorized_user", role: "member" },
      file: { buffer: VALID_JPEG_BUFFER, originalname: "logo.jpg", mimetype: "image/jpeg" },
    };

    let responseStatus = 0;
    let responseJson = null;

    const res = {
      status: (code) => {
        responseStatus = code;
        return {
          json: (data) => {
            responseJson = data;
          },
        };
      },
    };

    await updateTeamLogo(req, res);

    assert.equal(responseStatus, 403);
    assert.equal(responseJson.success, false);
    assert.match(responseJson.message, /Access denied/);
  });

  test("updateProjectCover: Rejects unauthorized user (403 Forbidden)", async () => {
    const mockProject = {
      _id: "proj_222",
      name: "Mobile App",
      manager: "manager_id_xyz",
      canManageProject: () => false,
    };

    ProjectModel.findById = async () => mockProject;

    const req = {
      params: { projectId: "507f1f77bcf86cd799439012" },
      user: { _id: "random_member", role: "member" },
      file: { buffer: VALID_JPEG_BUFFER, originalname: "cover.jpg", mimetype: "image/jpeg" },
    };

    let responseStatus = 0;
    let responseJson = null;

    const res = {
      status: (code) => {
        responseStatus = code;
        return {
          json: (data) => {
            responseJson = data;
          },
        };
      },
    };

    await updateProjectCover(req, res);

    assert.equal(responseStatus, 403);
    assert.equal(responseJson.success, false);
    assert.match(responseJson.message, /Access denied/);
  });

  test("deleteProfileAvatar: Successfully clears avatar metadata and calls deleteImage", async () => {
    let deletedFileId = null;
    imagekit.files.delete = async (fileId) => {
      deletedFileId = fileId;
    };

    const mockUser = {
      _id: "user_abc_123",
      avatar: "https://ik.imagekit.io/teamsync/avatar.jpg",
      avatarFileId: "avatar_file_id_555",
      save: async () => true,
    };

    UserModel.findById = async () => mockUser;

    const req = { user: { _id: "user_abc_123" } };
    let responseStatus = 0;
    let responseJson = null;

    const res = {
      status: (code) => {
        responseStatus = code;
        return {
          json: (data) => {
            responseJson = data;
          },
        };
      },
    };

    await deleteProfileAvatar(req, res);

    assert.equal(responseStatus, 200);
    assert.equal(responseJson.success, true);
    assert.equal(mockUser.avatar, "");
    assert.equal(mockUser.avatarFileId, "");
    assert.equal(deletedFileId, "avatar_file_id_555");
  });

  test("updateUserProfile: Successfully updates text fields without an image file", async () => {
    const mockUser = {
      _id: "user_abc_123",
      name: "Old Name",
      bio: "Old Bio",
      save: async function () {
        return this;
      },
    };

    UserModel.findById = async () => mockUser;

    const req = {
      user: { _id: "user_abc_123" },
      body: { name: "New Name", bio: "Updated Bio" },
      file: null,
    };

    let responseStatus = 0;
    let responseJson = null;

    const res = {
      status: (code) => {
        responseStatus = code;
        return {
          json: (data) => {
            responseJson = data;
          },
        };
      },
    };

    await updateUserProfile(req, res);

    assert.equal(responseStatus, 200);
    assert.equal(responseJson.success, true);
    assert.equal(mockUser.name, "New Name");
    assert.equal(mockUser.bio, "Updated Bio");
  });

  test("updateUserProfile: Successfully updates text fields AND uploads image file simultaneously", async () => {
    let deletedOldFileId = null;

    imagekit.files.upload = async () => ({
      url: "https://ik.imagekit.io/teamsync/combined_avatar.jpg",
      fileId: "combined_file_id_777",
      name: "combined_avatar.jpg",
      size: 1024,
    });

    imagekit.files.delete = async (fileId) => {
      deletedOldFileId = fileId;
    };

    const mockUser = {
      _id: "user_abc_123",
      name: "Alex Old",
      avatar: "old_url",
      avatarFileId: "old_file_to_clean",
      save: async function () {
        return this;
      },
    };

    UserModel.findById = async () => mockUser;

    const req = {
      user: { _id: "user_abc_123" },
      body: { name: "Alex New", jobTitle: "Senior Architect" },
      file: {
        buffer: VALID_JPEG_BUFFER,
        originalname: "avatar.jpg",
        mimetype: "image/jpeg",
        verifiedMimeType: "image/jpeg",
      },
    };

    let responseStatus = 0;
    let responseJson = null;

    const res = {
      status: (code) => {
        responseStatus = code;
        return {
          json: (data) => {
            responseJson = data;
          },
        };
      },
    };

    await updateUserProfile(req, res);

    assert.equal(responseStatus, 200);
    assert.equal(responseJson.success, true);
    assert.equal(mockUser.name, "Alex New");
    assert.equal(mockUser.jobTitle, "Senior Architect");
    assert.equal(mockUser.avatar, "https://ik.imagekit.io/teamsync/combined_avatar.jpg");
    assert.equal(mockUser.avatarFileId, "combined_file_id_777");
    // Ensure old file was safely cleaned up
    assert.equal(deletedOldFileId, "old_file_to_clean");
  });
});


describe("4. Route Ingress & Authentication Pipeline Tests", async () => {
  let server;
  let baseUrl;

  beforeEach(async () => {
    if (!server) {
      const { default: app } = await import("../src/app/app.js");
      await new Promise((resolve) => {
        server = app.listen(0, () => {
          const port = server.address().port;
          baseUrl = `http://localhost:${port}`;
          resolve();
        });
      });
    }
  });

  test("Health check endpoint returns healthy status", async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, "healthy");
  });

  test("PATCH /api/users/profile/image rejects unauthenticated requests (401)", async () => {
    const res = await fetch(`${baseUrl}/api/users/profile/image`, {
      method: "PATCH",
    });
    assert.equal(res.status, 401);
  });

  test("DELETE /api/users/profile/image rejects unauthenticated requests (401)", async () => {
    const res = await fetch(`${baseUrl}/api/users/profile/image`, {
      method: "DELETE",
    });
    assert.equal(res.status, 401);
  });

  test("PATCH /api/teams/:id/image rejects unauthenticated requests (401)", async () => {
    const res = await fetch(`${baseUrl}/api/teams/507f1f77bcf86cd799439011/image`, {
      method: "PATCH",
    });
    assert.equal(res.status, 401);
  });

  test("PATCH /api/projects/:id/image rejects unauthenticated requests (401)", async () => {
    const res = await fetch(`${baseUrl}/api/projects/507f1f77bcf86cd799439012/image`, {
      method: "PATCH",
    });
    assert.equal(res.status, 401);
  });

  test("POST /api/media/upload rejects unauthenticated requests (401)", async () => {
    const res = await fetch(`${baseUrl}/api/media/upload`, {
      method: "POST",
    });
    assert.equal(res.status, 401);
  });

  after(() => {
    return new Promise((resolve) => {
      if (server) {
        server.close(resolve);
      } else {
        resolve();
      }
    });
  });
});


