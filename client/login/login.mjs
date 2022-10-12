document.getElementById("loginBtn").addEventListener("click", (event) => {
    let usrBox = document.getElementById("usernameBox");
    let pswBox = document.getElementById("passwordBox");
    //console.log(usrBox, pswBox);
    let login = {
        "usr": usrBox.value,
        "psw": pswBox.value,
    }
    fetch("/login", {
        method: "POST",
        body: JSON.stringify(login),
    })
        .then(response => response.json())
        .catch(err => alert("No response from server: ", err))
        .then(data => {
            if (data.statusCode == 401) {
                let output = document.getElementById('info');
                output.value = "Incorrent credentials";
                output.style.color = "red";
            } else if (data.statusCode == 200) {
                document.cookie = `id=${data.id};path=/`;
                window.location.replace("../cms/cms.html");
            } else {
                output.value = `huh statuscode: ${data.statusCode}`
            }
        })
});