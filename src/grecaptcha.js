export const grecaptchaGoVerify = (action = 'homepage', userName) => async () => {
  const token = await window.grecaptcha.execute(
    '6Lfx8fIUAAAAAB6M1CCMuAyKl30blgxbCTvzxlUg',
    { action },
  );

  const fetchOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      response: token,
      userName,
    }),
  };

  const response = await fetch('/go-verify', fetchOptions);
  const json = await response.json();

  console.log('score: ', json.score);
};

export const grecaptchaReady = (action, userName) =>
  window.grecaptcha.ready(goVerify(action, userName));
