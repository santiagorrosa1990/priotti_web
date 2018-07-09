$(document).ready(function () {



    $.ajax({
        method: 'GET',
        url: 'http://localhost:4567/items',
        success: function (data) {
            $('#myTable').DataTable({
                data: data,
                columns: [
                    { title: "COdigo" },
                    { title: "Marca" },
                    { title: "Rubro" }
                ]
            });
        },
        error: function (error) {
            alert("Error de conexión");
        }
    });



/*
    checkSession();

    $("#login-btn").on("click", function () {
        var datos = $("#login-form").serialize();
        $.ajax({
            method: 'POST',
            url: 'http://localhost:4567/login',
            data: datos,
            success: function (data) {
                document.cookie = "username=" + data.data.nombre + "," + "surname=" + data.data.apellido;
                checkSession();
            },
            error: function (error) {
                alert("Error de conexión");
            }
        });
        return false;
    });

    function checkSession() {
        //alert(document.cookie);
        var username = getCookie("username");
        var surname = getCookie("surname");
        if (username != "" && surname != "") {
            $("#login-title").empty();
            $("#login-title").append("Bienvenido: " + username + " " + surname);
        } else {
            $("#login-title").append("Login:");
        }
    }

    function getCookie(cname) {
        var cookie = document.cookie;
        var ca = cookie.split(',');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            var pair = c.split('=');
            if (cname == pair[0]) {
                return pair[1];
            }
        }
        return "";
    }
*/

});