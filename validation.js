/* 
   Client-side validation for the login and register forms
   Pattern: each rule returns an error message ('' = valid)
    */

/* 1. Constants  */
const MIN_PASSWORD_LENGTH = 6;

// name@domain.tld  ->  no spaces, exactly one @, a dot in the domain,
// and a TLD of at least 2 characters. Good enough for client-side UX;
// the server must still verify the email.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/*  2. Rules: pure functions, no DOM access  */
// Each rule gets (value, form) and returns a message, or '' if valid.
const rules = {
  name(value) {
    const name = value.trim();
    if (!name) return 'Full name is required.';
    if (name.length < 2) return 'Full name must be at least 2 characters.';
    return '';
  },

  email(value) {
    const email = value.trim();
    if (!email) return 'Email is required.';
    if (!EMAIL_REGEX.test(email)) return 'Enter a valid email, like name@example.com.';
    return '';
  },

  password(value) {
    if (!value) return 'Password is required.';
    if (value.length < MIN_PASSWORD_LENGTH) {
      return `Password must be at least ${MIN_PASSWORD_LENGTH} characters (you have ${value.length}).`;
    }
    return '';
  },

  confirm(value, form) {
    if (!value) return 'Please confirm your password.';
    const password = form.querySelector('[data-validate="password"]').value;
    if (value !== password) return 'Passwords do not match.';
    return '';
  },
};

/*  3. UI helpers: show or clear a message  */
function setFieldError(input, message) {
  document.getElementById(`${input.id}-error`).textContent = message;
  input.setAttribute('aria-invalid', message ? 'true' : 'false');
}

function setFormError(form, message) {
  form.querySelector('.form-error').textContent = message;
}

function validateField(input) {
  const rule = rules[input.dataset.validate];
  const message = rule(input.value, input.form);
  setFieldError(input, message);
  return message;
}

/*  4. Fake server call (replace with fetch)  */
async function sendToServer(formName, data) {

  await new Promise(resolve => setTimeout(resolve, 400));
  return { ok: true };
}

/* 5. Wire up each form */
document.querySelectorAll('form[data-form]').forEach(form => {
  const inputs = [...form.querySelectorAll('[data-validate]')];
  const success = form.querySelector('.success');
  const submitBtn = form.querySelector('button[type="submit"]');

  inputs.forEach(input => {
    
    input.addEventListener('blur', () => validateField(input));

    .
    input.addEventListener('input', () => {
      if (input.getAttribute('aria-invalid') === 'true') validateField(input);

      
      if (input.dataset.validate === 'password') {
        const confirm = form.querySelector('[data-validate="confirm"]');
        if (confirm && confirm.value) validateField(confirm);
      }
    });
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    setFormError(form, '');
    success.hidden = true;

    
    const invalid = inputs.filter(input => validateField(input));
    if (invalid.length > 0) {
      invalid[0].focus();                    // send the user to the first problem
      return;
    }

    
    submitBtn.disabled = true;               // prevent double submit
    try {
      const data = Object.fromEntries(new FormData(form));
      delete data.confirm;                   // server doesn't need it
      await sendToServer(form.dataset.form, data);

      if (form.dataset.form === 'register') {
        form.reset();
        location.hash = 'login';             // registered -> go to login view
      } else {
        success.textContent = 'Logged in successfully (demo).';
        success.hidden = false;
      }
    } catch (error) {
      setFormError(form, 'Something went wrong. Please try again.');
    } finally {
      submitBtn.disabled = false;         
    }
  });
});