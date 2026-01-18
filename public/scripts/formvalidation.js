
console.log("Inside script2.js");




// Check if an individual element exists
function addEventIfIdExists(selector, event, callback) {
    const element = document.querySelector(selector);
    if (element) element.addEventListener(event, callback);
}





function setError(element, message) {
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error');

    errorDisplay.innerText = message;
    inputControl.classList.add('error');
    inputControl.classList.remove('success')
}

function setSuccess(element) {
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error');

    errorDisplay.innerText = '';
    inputControl.classList.add('success');
    inputControl.classList.remove('error');
};

function isValidEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function isValidPassword(password) {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return re.test(password);
}

async function validateSignUpForm(firstName, lastName, username, email, password, confirmPassword) {

    let isValid = true;

    const firstNameValue = firstName.value.trim();
    const lastNameValue = lastName.value.trim();
    const usernameValue = username.value.trim();
    const emailValue = email.value.trim();
    const passwordValue = password.value.trim();
    const confirmPasswordValue = confirmPassword.value.trim()

    if(firstNameValue === '') {
        isValid = false;
        setError(firstName, 'First name is required');
    } else {
        setSuccess(firstName);
    }

    if(lastNameValue === '') {
        isValid = false;
        setError(lastName, 'Last name is required');
    } else {
        setSuccess(lastName);
    }

    if(usernameValue === '') {
        isValid = false;
        setError(username, 'Username is required');
    } else {
        setSuccess(username);
    }

    if(emailValue === '') {
        isValid = false;
        setError(email, 'Email is required');
    } else if (!isValidEmail(emailValue)) {
        isValid = false;
        setError(email, 'Provide a valid email address');
    } else {
        setSuccess(email);
    }

    if(passwordValue === '') {
        isValid = false;
        setError(password, 'Password is required');
    } else if (passwordValue.length < 8 ) {
        isValid = false;
        setError(password, 'Password must be at least 8 character.')
    } else if (!isValidPassword(passwordValue) ) {
        isValid = false;
        setError(password, 'Password must have an uppercase, lowercase, number, and special character.')
    } else {
        setSuccess(password);
    }

    if(confirmPasswordValue === '') {
        isValid = false;
        setError(confirmPassword, 'Please confirm your password');
    } else if (confirmPasswordValue !== passwordValue) {
        isValid = false;
        setError(confirmPassword, "Passwords doesn't match");
    } else {
        setSuccess(confirmPassword);
    }

    return isValid;

};


async function validateSignInForm(email, password) {

    let isValid = true;

    const emailValue = email.value.trim();
    const passwordValue = password.value.trim();

    if(emailValue === '') {
        isValid = false;
        setError(email, 'Email is required');
    } else if (!isValidEmail(emailValue)) {
        isValid = false;
        setError(email, 'Provide a valid email address');
    } else {
        setSuccess(email);
    }

    if(passwordValue === '') {
        isValid = false;
        setError(password, 'Password is required');
    } else {
        setSuccess(password);
    }

    return isValid;

}


async function main() {

    let isValid = true;

    let firstName = document.getElementById("firstNameInput");
    let lastName = document.getElementById("lastNameInput");
    let username = document.getElementById("usernameInput");
    let email = document.getElementById("emailInput");
    let password = document.getElementById("passwordInput");
    let confirmPassword = document.getElementById("confirmPasswordInput");

    addEventIfIdExists(".signup-signin-form", "submit", async (e) => {

        e.preventDefault();

        if (firstName) {
            isValid = await validateSignUpForm(firstName, lastName, username, email, password, confirmPassword);
        } else {
            isValid = await validateSignInForm(email, password);
        }

        if (isValid) {
            document.querySelector(".signup-signin-form").submit()
        }
    });

}

main();
