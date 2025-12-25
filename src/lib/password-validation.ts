// https://stackoverflow.com/questions/76886215/how-use-react-password-checklist-with-zod
export const passwordValidation = (
  password: string,
  addIssue: (issue: {
    code: "custom";
    path: (string | number)[];
    message: string;
  }) => void
) => {
  const validations = [
    {
      test: (pwd: string) => /[A-Z]/.test(pwd),
      message: "At least 1 upper case character required.",
    },
    {
      test: (pwd: string) => /[a-z]/.test(pwd),
      message: "At least 1 lower case character required.",
    },
    {
      test: (pwd: string) => /\d/.test(pwd),
      message: "At least 1 number required.",
    },
  ];

  const errorMessages = validations
    .filter(({ test }) => !test(password))
    .map(({ message }) => message);

  if (errorMessages.length > 0) {
    addIssue({
      code: "custom",
      path: ["password"],
      message: errorMessages.join("\n"),
    });
  }
};
