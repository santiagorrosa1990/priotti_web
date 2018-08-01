$(document).ready(function () {
    //Boton descargar lista .xlsx
    $("#bdescargarlista").on("click", function (e) {
        e.preventDefault();  //stop the browser from following
        var tkn = localStorage.token;
        var uri = 'http://localhost:4567/xls?tkn='+tkn;
        window.location.href = uri;
        return false;
    });
});