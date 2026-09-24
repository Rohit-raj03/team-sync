export const validateTask = (values) => {
  const errors = {};
  if (!values.title?.trim()) {
    errors.title = 'Title is required';
  }
  return errors;
};
