$(document).ready(function () {

    $('#upload').on('click', function (event) {
        event.preventDefault();
        var files = [];
        files[$('#file').prop('files')[0].name] = $('#file').prop('files')[0];
        files[$('#file').prop('files')[1].name] = $('#file').prop('files')[1];
        files[$('#file').prop('files')[2].name] = $('#file').prop('files')[2];
        sendFiles(files);
    });

    async function sendFiles(files) {
        var alineasx = await readUploadedFileAsText(files["alineasx.txt"]);
        var arubrosx = await readUploadedFileAsText(files["arubrosx.txt"]);
        var aprecios = await readUploadedFileAsText(files["aprecios.txt"]);
        alineasx = processLineas(alineasx);
        arubrosx = processRubros(arubrosx);
        aprecios = processPrecios(aprecios);
        var requestBody = '{"lineas":' + alineasx + ',"rubros":' + arubrosx + ',"precios":' + aprecios + '}';
        console.log(requestBody);
        $.ajax({
            method: 'POST',
            url: 'http://localhost:4567/item/all',
            data: requestBody,
            success: function (data) {
                console.log(data);
            },
            error: function (error) {
                alert("Error de conexión");
            }
        });
    }

    const readUploadedFileAsText = (inputFile) => {
        const temporaryFileReader = new FileReader();

        return new Promise((resolve, reject) => {
            temporaryFileReader.onerror = () => {
                temporaryFileReader.abort();
                reject(new DOMException("Problem parsing input file."));
            };

            temporaryFileReader.onload = () => {
                resolve(temporaryFileReader.result);
            };
            temporaryFileReader.readAsText(inputFile);
        });
    };

    function processLineas(data) {
        var lines = data.split('\n');
        var body = '{';
        lines.forEach(function (element, index) {
            if (element != "") {
                element = element.replace(/\s/g, "").replace(/["']/g, "").trim();
                var codigo = element.substring(0, 4);//Codigo de linea
                var linea = element.substring(4);//Nombre de linea
                //var object = '{"codigo":"' + codigo + '", "linea":"' + linea + '"}, ';
                var object = '"'+codigo+'":"'+linea+'", ';
                body += object;
            }
        });
        body = body.slice(0, -2);
        body += '}';
        return body;
    }

    function processRubros(data) {
        var lines = data.split('\n');
        var body = '{';
        lines.forEach(function (element, index) {
            if (element != "") {
                element = element.replace(/["']/g, '').trim();
                var lineayrubro = element.substring(0, 7);//codigo de linea
                //var rubro = element.substring(4, 7);//codigo de rubro (por si solo no es univoco)
                var descripcion = element.substring(7);//descripcion del rubro
                //var object = '{"linea":"' + linea + '", "rubro":"' + rubro + '", "descripcion":"' + descripcion + '"}, ';
                var object = '"'+lineayrubro+'":"'+descripcion+'", ';
                body += object;
            }
        });
        body = body.slice(0, -2);
        body += '}';
        return body;
    }

    function processPrecios(data) {
        var lines = data.split('\n');
        var body = '[';
        var cont = 0;
        lines.forEach(function (element, index) {
            cont = cont + 1;
            if (element != "") {
                element = element.replace(/["']/g, '').trim();
                var linea = element.substring(0, 4).trim();//Codigo de linea
                var rubro = element.substring(4, 7).trim();//Codigo de rubro
                var codigo = element.substring(7, 27).trim();//Codigo de producto
                var aplicacion = element.substring(27, 62).trim();//Aplicacion del producto
                var precio = element.substring(62).trim();//Precio del producto
                var object = '{"codigo":"' + codigo + '", "linea":"' + linea + '", "rubro":"' + rubro +
                    '", "aplicacion":"' + aplicacion + '", "precio":"' + precio + '"}, ';
                if (cont < 3) body += object;
            }
        });
        body = body.slice(0, -2);
        body += ']';
        return body;
    }


});