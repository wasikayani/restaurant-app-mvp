// src/hooks/useForm.js
// Question 9 – reusable form logic as a CUSTOM HOOK.
//
// Usage:
//   const { values, errors, handleChange, handleSubmit, reset, isValid } =
//     useForm(initialValues, validate);
//
//   validate(values) must return an object of errors, e.g. { email: 'Invalid email' }.
//   An empty object means the form is valid.
//
// Hook rules followed: the name starts with "use", other hooks are called only at
// the top level of this function, and it returns data/functions – never JSX.

import { useState, useRef, useCallback, useMemo } from 'react';

export default function useForm(initialValues, validate) {
  // Remember the very first initial values so reset() always goes back to them
  const initialRef = useRef(initialValues);

  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  // Update one field AND clear that field's error as soon as the user edits it
  const handleChange = useCallback((field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev; // nothing to clear -> keep the same object
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  // Validate everything; call onValid(values) if OK, otherwise onInvalid(errors)
  const handleSubmit = (onValid, onInvalid) => {
    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      onValid(values);
    } else if (onInvalid) {
      onInvalid(validationErrors);
    }
  };

  // Back to the initial values (or to new values passed in) with no errors
  const reset = useCallback((nextValues) => {
    setValues(nextValues ?? initialRef.current);
    setErrors({});
  }, []);

  // True when the current values pass validation (e.g. to enable a button)
  const isValid = useMemo(() => Object.keys(validate(values)).length === 0, [values, validate]);

  return { values, errors, handleChange, handleSubmit, reset, isValid };
}
