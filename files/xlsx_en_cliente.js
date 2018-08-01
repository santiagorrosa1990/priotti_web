/*$(document).ready(function () {
    //Boton descargar lista .xlsx
    $("#bdescargarlista").on("click", function (e) {
        e.preventDefault();  //stop the browser from following
        var tkn = localStorage.token;
        var uri = 'http://localhost:4567/xls?tkn='+tkn;
        window.location.href = uri;
        window.location.href = 'http://localhost:3000/admin';
        console.log("inicio");
        var wbout = createSpreadSheet(fetchRawList());
        saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), 'test.xlsx');
        return false;
    });

    /*function fetchRawList(){
        var json;
        $.ajax({
            method: "GET",
            async: false,
            url: "http://localhost:4567/item",
            statusCode: {
                200: function (data) {
                    console.log("response ok");
                    json = data;
                },
                403: function (data) {
                    toastr.error("No autorizado", "Ups!");
                },
                0: function (data) {
                    toastr.error("Servicio no disponible", "Ups!");
                }
            }
        });
        return json;
    }

    function createSpreadSheet(list) {
        var wb = XLSX.utils.book_new(); //creo el libro
        wb.Props = { //asigno propiedades
            Title: "Lista de Precios",
            Subject: "Test",
            Author: "Felipe Priotti S.A",
            CreatedDate: new Date(2017, 12, 19)
        }
        wb.SheetNames.push("Test Sheet"); //creo nueva la hoja
        var ws = XLSX.utils.aoa_to_sheet([["Código", "Aplicación", "Rubro", "Marca", "Precio"]]); //convierto los datos en hoja
        XLSX.utils.sheet_add_aoa(ws, list, {origin:-1});
        wb.Sheets["Test Sheet"] = ws; //asigno la nueva hoja
        var wbout = XLSX.write(wb, {bookType:'xlsx',  type: 'binary'});
        console.log("sheet created");
        return wbout;
    }

    function s2ab(s) { 
        var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
        var view = new Uint8Array(buf);  //create uint8array as viewer
        for (var i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
        return buf;    
}

});*/