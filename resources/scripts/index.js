$(document).ready(function () {

    var coef = 1;
    //var coef2 = 1;
    var tabla = null;
    var tablac = null;
    var tablahc = null;
    var busqueda = "";
    var busquedaux = "";
    var cantidad = 0;
    var opccarrito = 1;
    var cantidadaux = 0;
    var articulo = "";
    var timeout = null;
    var tipolista = 2;
    var confotos = false;
    var op = false;
    var onlyOffers = false;
    var onlyNovelties = false;

    //CARGA INICIAL
    setItemTable(); //Aca se decide si es full o basic
    showtablap(true);
    clickednav($("#productos"));
    renderCartTable();
    //actfechas();

    //Compruebo sesión existente en recarga de pagina
    checkOnReload();

    //NAV BAR

    //nav bar productos
    $("#productos").on("click", function (e) {
        clickednav($(this));
        setjumbo('', 'Productos');
        togglebotones(true);
        showtablap(true);
        showcontacto(false);
        return false;
    });

    //Datos empresa
    $("#empresa").on("click", function (e) {
        /*clickednav($(this));
        togglebotones(false);
        showtablac(false);
        showtablap(false);*/
        return false;
    });

    $("#contacto").on("click", function (e) {
        clickednav($(this));
        showtablap(false);
        showcontacto(true);
        setjumbo('', 'Contacto');
        togglebotones(false);
        return false;
    });

    //SELECTORES INDEX

    //Buscador de productos 
    $("#buscador").on("change paste keyup", function () {
        clearTimeout(timeout);
        timeout = setTimeout(function () {
            busqueda = $("#buscador").val();
            busqueda = busqueda.trim();
            if (busqueda != busquedaux) {
                busquedaux = busqueda;
                searchItems(busqueda);
            }
        }, 500);
    });

    //Multiplicador revendedor
    $("#coefreventa").on("change paste keyup", function () {
        clearTimeout(timeout);
        timeout = setTimeout(function () {
            coef = $("#coefreventa").val();
            if (isNaN(coef)) {
                coef = 1;
            } else {
                coef = coef / 100 + 1;
            }
            searchItems(busqueda);
        }, 500);
    });

    //Boton Iniciar Sesion
    $("#entrar").on("click", function (e) {
        login(buildLoginRequest());
        return false;
    });

    function login(data) {
        $.ajax({
            method: "POST",
            url: "http://localhost:4567/login",
            data: data,
            statusCode: {
                200: function (data) {
                    var username = parseJwt(data).username;
                    toastr.success("Bienvenido, " + username);
                    $("#datosingreso").slideUp();
                    $("#datossesion p").text(username);
                    $("#datossesion").removeClass("oculto");
                    $("#bofertas").removeClass("oculto");
                    $('#botoncarrito').show();
                    viewColumnToggles(true);
                    setLocalStorage(data);
                    setItemTable();

                    //tablacarrito();
                    //tablahistcompras();

                    /*
                    $("#bdescargarlista").removeClass("oculto");
                    vertogglescolumnas(true);
                    resettogglescolumnas();*/
                },
                403: function () {
                    toastr.error("Datos incorrectos", "Ups!");
                },
                0: function () {
                    toastr.error("Servicio no disponible", "Ups!");
                }
            }
        });
    }

    function parseJwt(token) { //@Smell
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace('-', '+').replace('_', '/');
        return JSON.parse(window.atob(base64));
    };

    function setLocalStorage(data) {
        localStorage.token = data;
        localStorage.username = parseJwt(data).username;
    }

    function buildLoginRequest() {
        var credentials = {
            credentials: {
                username: $("#usuario").val(),
                password: $("#clave").val()
            }
        }
        $("#usuario").val("");
        $("#clave").val("");
        return JSON.stringify(credentials);
    }

    //Cerrar Sesion
    $("#salir").on("click", function (e) {
        logout();
    });

    //Ver sólo ofertas
    $("#bofertas").on("click", function () {
        unpressed();
        $(this).addClass("active btn-info");
        onlyOffers = true;
        searchItems(busqueda);
        return false;
    });

    //Ver todos los precios
    $("#btodos").on("click", function () {
        unpressed();
        $(this).addClass("active btn-info");
        onlyNovelties = false;
        onlyOffers = false;
        searchItems(busqueda);
        return false;
    });

    //Ver solo novedades
    $("#bnovedades").on("click", function () {
        unpressed();
        $(this).addClass("active btn-info");
        onlyNovelties = true;
        searchItems(busqueda);
        return false;
    });

    function unpressed() {
        $("#btodos").removeClass("active btn-info");
        $("#bofertas").removeClass("active btn-info");
        $("#bnovedades").removeClass("active btn-info");
        onlyNovelties = false;
        onlyOffers = false;
    }

    //Toggles de las columnas de la tabla
    $('.toggle-vis').on('click', function (e) {
        //e.preventDefault();

        // Get the column API object
        var column = tabla.column($(this).attr('data-column'));

        if ($(this).attr('data-column') == 9) {
            togglefotos();
        }

        if ($(this).attr('data-column') == 8) {
            togglerevendedor();
        }
        // Toggle the visibility
        column.visible(!column.visible());
    });

    //Se muestra la imagen tamaño real cuando se hace click en la fotito
    $('#tabla').on('click', '#myImg', function () {
        var fila = $(this).closest('tr');
        console.log(tabla.row(fila).data());
        fila = tabla.row(fila).data();
        if (fila != null) { //Cuando la tabla esta responsive la fila se pone null    
            var error = "javascript:this.src='./Resources/fotos/default.jpg'"
            var imagen = '<img src="./Resources/fotos/' + fila['imagen'] + '.jpg" onerror="' + error + '">';
            $.alert({
                title: fila['marca'] + ' - ' + fila['codigo'],
                //content: '<img src="../fotos/' + fila['imagen'] + '.jpg" alt="' + fila['imagen'] + '">',
                content: imagen//'<img src="./Resources/fotos/' + fila['imagen'] + '.jpg">',
            });
        }
        return false;
    });

    //Boton enviar mensaje de contacto
    $('#enviarmsj').on('click', function () {
        var datos = $("#formulariocontacto").serialize();
        $.ajax({
            method: "POST",
            url: "./Utils/email.php",
            data: datos + '&opc=2',
            success: function (data) {
                if (data.includes('Gracias')) {
                    toastr.success(data, "Mensaje enviado!");
                    $("#formulariocontacto .form-control").val("");
                } else {
                    toastr.error(data, "Error");
                }
            },
            error: function () {
                toastr.error("Error de servidor, intente nuevamente", "Error");
            }
        });
        return false;
    });

    //POSIBLES    

    //Boton descargar lista .xlsx
    $("#bdescargarlista").on("click", function () {
        descargarxlsx();
        return false;
    });

    //FUNCION DATATABLES



    function searchItems(keywords) {
        var request = buildItemRequest(keywords);
        var uri;
        if (localStorage.token != null) {
            uri = "http://localhost:4567/item/full";
        } else {
            uri = "http://localhost:4567/item/basic";
        }
        $.ajax({
            method: "POST",
            dataType: "json",
            url: uri,
            data: request,
            statusCode: {
                200: function (data) {
                    tabla.clear().rows.add(data).draw();
                },
                403: function (data) {
                    toastr.error("No autorizado", "Ups!");
                },
                0: function (data) {
                    toastr.error("Servicio no disponible", "Ups!");
                }
            }
        });
    }

    function buildItemRequest(keywords) {
        var request = {
            token: localStorage.token,
            keywords: keywords,
            offer: onlyOffers,
            novelty: onlyNovelties,
        }
        return JSON.stringify(request);
    }

    function renderFullItemTable() {
        tabla = $("#tabla").DataTable({
            responsive: true,
            bFilter: false,
            columns: [
                { title: "Codigo" },
                { title: "Aplicación" },
                { title: "Marca." },
                { title: "Rubro" },
                { title: "Equivalencia" },
                { title: "Precio" },
                { title: "Oferta" },
                { title: "Neto" },
                { title: "Revendedor" },
                { title: "Imagen" }
            ],
            columnDefs:
                [
                    {
                        targets: [5], //Precio
                        responsivePriority: 1,
                        render: function (data, type, row) {
                            if (Number(row[6]) == 0) {
                                return '$' + Number(data).toFixed(2);
                            } else {
                                return '<div class="tachado"> $ ' + Number(data).toFixed(2) + '</div>';
                            }
                        }
                    },
                    {
                        targets: [4], //Equivalencia
                        visible: false
                    },
                    {
                        targets: [6], //Oferta
                        responsivePriority: 0,
                        render: function (data, type, row) {
                            if (row[6] == 0) {
                                return "---";
                            } else {
                                return '$' + Number(data).toFixed(2);
                            }

                        },
                    },
                    {
                        targets: [7], //Neto
                        responsivePriority: 1,
                        render: function (data, type, row) {
                            if (row[6] == 0) {
                                return "---";
                            } else {
                                return '$' + Number(row[6] * 0.5643).toFixed(2);
                            }

                        },
                    },
                    {
                        targets: [8], //Reventa
                        responsivePriority: 1,
                        render: function (data, type, row) {
                            return '$' + (row[5] * coef).toFixed(2);
                        },
                        visible: false
                    },
                    {
                        targets: [9], //Foto
                        render: function (data, type, row) {
                            if (confotos == 0) return row[7];
                            var error = "javascript:this.src='http://localhost:3000/fotos/default.jpg'";
                            return '<img src="http://localhost:3000/fotos/' + row[7] + '.jpg" onerror="' + error + '" id="myImg">';
                        },
                        visible: false
                    }
                ],
        });
        searchItems(busqueda);
    }

    function renderBasicItemTable() {
        tabla = $("#tabla").DataTable({
            columns: [
                { title: "Codigo" },
                { title: "Aplicación" },
                { title: "Marca." },
                { title: "Rubro" },
            ],
            responsive: true,
            bFilter: false,
        });
        searchItems(busqueda);
    }

    function setItemTable() {
        if (tabla != null) {
            tabla.destroy();
            $("#tabla").slideUp();
            $("#tabla").empty();
        }
        searchItems(busqueda); //Ajax es asíncrono =O
        if (localStorage.token != null) {
            renderFullItemTable();
        } else {
            renderBasicItemTable();
        }
        $("#tabla").slideDown();
    }

    //FUNCIONES

    //fechas de act lista y ofertas
    function actfechas() {
        $.ajax({
            method: "POST",
            url: "./Modelo/DAOActualizar.php",
            data: "opc=3",
            success: function (data) {
                data = JSON.parse(data);
                $('#fechactualizado').append(' ' + data[1]);
                //$('#ultimaoferta').text(' ' + data[0]);
                //$('#ultimalista').text(' ' + data[1]);
            },
            error: function () {
                toastr.error("Problemas de conexion", "Error");
            }
        });
    }

    function showtablap(op) {
        if (op === true) {
            $("#tablaproductos").fadeIn();
        } else {
            $("#tablaproductos").hide();
        }
    }

    function showcontacto(op) {
        if (op === true) {
            $("#modulocontacto").fadeIn();
        } else {
            $("#modulocontacto").hide();
        }
    }

    function iniciarsesion(data) {
        if (data.includes('["')) {
            data = JSON.parse(data);
            $("#datosingreso").slideUp();
            $("#datossesion p").text(data[0]);
            botoncarrito(true); //Muestro la opcion de carrito
            $("#datossesion").removeClass("oculto");
            $("#bofertas").removeClass("oculto");
            $("#bdescargarlista").removeClass("oculto");
            toastr.success("Bienvenido " + data[0]);
            if (coef != data[1]) {
                coef = data[1];
                tabla.ajax.reload();
            }
            toggleprecios();
            tablacarrito();
            tablahistcompras();
            vertogglescolumnas(true);
            resettogglescolumnas();
        } else if (data.includes("no iniciada")) {
            $("#datosingreso").slideDown(500);
        } else {
            toastr.error(data, "Error");
        }
    }

    function clearLocalStorage() {
        localStorage.removeItem("username");
        localStorage.removeItem("token");
    }

    function logout() {
        clearLocalStorage();
        setItemTable();
        viewColumnToggles(false);
        unpressed();
        $("#datossesion").addClass("oculto");
        $("#bofertas").addClass("oculto");
        //$("#bdescargarlista").addClass("oculto");
        $("#datossesion p").text("");
        $("#datosingreso").slideDown(500);
        $("#usuario").val("");
        $("#clave").val("");
        $('#botoncarrito').hide();
        toggleCarrito(false);
        //$('#clientes').addClass('oculto');
        //botoncarrito(false);//Saco el boton de carrito
        //toggleprecios();
        //toggleCarrito(false);
        //vertogglescolumnas(false);
        //resettogglescolumnas();
    }

    function descargarxlsx() {
        $.ajax({
            method: "POST",
            url: "./Modelo/DAOProductos.php",
            data: "opc=5",
            async: false,
            success: function (data) {
                if (data.includes('listapriotti')) {
                    data = data.trim(); //DEvuelve el string con espacio adelante =/
                    toastr.success("Descargando...", "¡Lista generada!");
                    var path = './Resources/uploads/' + data + '.xlsx';
                    window.location.href = path;
                } else {
                    toastr.error(data, "Error");
                }
            },
            error: function () {
                toastr.error("Error de conexion", "Error");
            }
        });
    }

    function toggleprecios() {
        if (tablaexiste()) {
            var column = tabla.column(5);
            column.visible(!column.visible());
            var column = tabla.column(6);
            column.visible(!column.visible());
            var column = tabla.column(7);
            column.visible(!column.visible());
            /*var column = tabla.column(8);
            column.visible(!column.visible());*/
        }
    }

    function togglerevendedor() {
        if ($('#revendedor').is(':visible')) {
            $('#revendedor').hide();
        } else {
            $('#revendedor').show();
        }
    }

    function viewColumnToggles(op) {
        if (op == true) {
            resettogglescolumnas();
            $('#togglera').show();
        } else {
            $('#togglera').hide();
        }
    }

    function resettogglescolumnas() {
        $('#fotos').prop('checked', false);

        $('#aplicacion').prop('checked', true);

        $('#marca').prop('checked', true);

        $('#rubro').prop('checked', true);

        $('#equivalencias').prop('checked', false);

        $('#reventa').prop('checked', false);

        $('#revendedor').hide();
        // $('#coefreventa').val('');
    }

    function toggleequiv() {
        if (tablaexiste()) {
            var column = tabla.column(4);
            column.visible(!column.visible());
        }
    }

    function togglefotos() {
        if (tablaexiste()) {
            confotos = !confotos;
            searchItems(busqueda);
        }
    }

    function tablaexiste() {
        if (tabla != null) {
            return true;
        } else {
            return false
        }
    }

    function checkOnReload() {
        if (cookieSessionExist()) {
            var username = localStorage.username
            toastr.success("Bienvenido " + username);
            $("#datossesion p").text(username);
            $("#datossesion").removeClass("oculto");
            $("#bofertas").removeClass("oculto");
            viewColumnToggles(true);
            $('#botoncarrito').show();
        } else {
            $("#datosingreso").slideDown(500);
        }
    }

    function cookieSessionExist() {
        //return getCookie("username") != ""; 
        return localStorage.token != null;
        //TODO ver TOKEN AUTH
    }

    function setjumbo(dis, subdis) {
        $(".jumbotron #titulo").hide();
        $(".jumbotron #subtitulo").hide();
        $(".jumbotron #titulo").text(dis);
        $(".jumbotron #subtitulo").text(subdis);
        $(".jumbotron #titulo").show();
        $(".jumbotron #subtitulo").show();
    }
    //muestra u oculta los botones de ofertas, novedades, descargar, etc
    function togglebotones(op) {
        if (op === true) {
            $("#botonesprod").fadeIn(200);
        } else {
            $("#botonesprod").fadeOut(200);
        }
    }
    //efecto clickeado en los botones del nav
    function clickednav(sel) {
        $('#productos').removeClass('negro');
        $('#empresa').removeClass('negro');
        $('#clientes').removeClass('negro');
        $('#contacto').removeClass('negro');
        sel.addClass('negro');
    }

    //VARIOS

    toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": false,
        "progressBar": true,
        "positionClass": "toast-top-center",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }



    //BLOQUE CARRITO DE COMPRAS

    function toggleCarrito(op) {
        if (op == true) {
            $('#tablacontainer').removeClass('col-md-12').addClass('col-md-8');
            $('#carritocompra').addClass('col-md-4').slideDown();
        } else {
            $('#tablacontainer').removeClass('col-md-8').addClass('col-md-12');
            $('#carritocompra').addClass('oculto').slideUp();
        }
    }

    //Botón enviar pedido
    $('#enviarpedido').on('click', function () {
        var valido = true;
        var cont = 0;
        var actual = $('#tablac .form-control');
        //Se chequea que el carro no este vacio y que los items no tengan cantidad 0
        actual.each(function () {
            cont = cont + 1;
            if ($(this).val() == 0) valido = false;
        });
        if (valido && cont > 0) {
            $.confirm({
                title: 'Confirmar envío:',
                content: '' +
                    '<form class="formName" id="comentario">' +
                    '<div class="form-group">' +
                    '<label>Comentarios:</label>' +
                    '<textarea name="comentario" cols="50" rows="10" class="form-control" type="text"> Agregue aquí sus aclaraciones (transporte, etc)</textarea>' +
                    '</div>' +
                    '</form>',
                buttons: {
                    formSubmit: {
                        text: 'Enviar Pedido',
                        btnClass: 'btn-blue',
                        action: function () {
                            var datos = $('#comentario').serialize() + '&opcemail=1';
                            //alert(datos);
                            $.ajax({
                                method: "POST",
                                url: "./Utils/email.php",
                                data: datos,
                                success: function (data) {
                                    if (data.includes('enviado!')) {
                                        toastr.success(data);
                                        opccarrito = 1;
                                        tablac.ajax.reload();
                                        tablahc.ajax.reload();
                                    } else {
                                        toastr.error(data);
                                    }
                                },
                                error: function () {
                                    toastr.error("Servidor ocupado, intente nuevamente", "Error");
                                }
                            });
                        }
                    },
                    cancel: function () {
                        //close
                    },
                }
            });
            return false;
        } else {
            toastr.error("El carrito está vacío o con items sin cantidad");
        }
        return false;
    });

    //Actualizar cantidad por item
    $("#tablac").on("change paste keyup", "input", function () {
        cantidad = $(this).val();
        var fila = $(this).parents('tr');
        clearTimeout(timeout);
        timeout = setTimeout(function () {
            fila = tablac.row(fila).data();
            opccarrito = 4;
            if (cantidad == "") cantidad = 0;
            articulo = fila['codigo'] + '&' + fila['marca'] + '&' + cantidad;
            tablac.ajax.reload();
        }, 500);
    });

    $("#botoncarrito").on("click", function () {
        if ($('#tablacontainer').hasClass('col-md-12')) {
            toggleCarrito(true);
        } else {
            toggleCarrito(false);
        }
    });

    //Botón mis pedidos
    $('#mispedidos').on('click', function () {
        $('#tablacarrito').hide();
        //if (tablahc != null) tablahc.ajax.reload();
        $('#tablahistorialcarrito').show();
        return false;
    });

    $('#pedidoactual').on('click', function () {
        $('#tablahistorialcarrito').hide();
        $('#tablacarrito').show();
        return false;
    });

    function renderCartTable() {
        tablac = $("#tablac").DataTable({
            responsive: true,
            bFilter: false,
            columns: [
                { title: "Codigo", width: "40%" },
                { title: "Marca", width: "25%" },
                { title: "Cantidad", width: "25%" },
                { title: "Quitar", width: "10%" },
            ],
            columnDefs: [
                {
                    responsivePriority: 2,
                    targets: [2], //Cantidad
                    orderable: false,
                    render: function (data, type, row) {
                        return '<input class="width55 form-control" value=' + row[2] + ' type="text">';
                    }
                },
                {
                    responsivePriority: 0,
                    targets: [3], //Boton quitar de pedido 
                    orderable: false,
                    render: function () {
                        return '<i class="fa fa-times fa-2x rojo" id="cruzroja" aria-hidden="true"></i>';
                    }
                },
            ]
        });
        refreshCartTable();
    }

    function refreshCartTable() {
        var request = "wewe";
        $.ajax({
            method: "POST",
            dataType: "json",
            url: "http://localhost:4567/item/cart",
            data: request,
            statusCode: {
                200: function (data) {
                    tablac.clear().rows.add(data).draw();
                },
                403: function (data) {
                    toastr.error("Carrito no disponible", "Ups!");
                },
                0: function (data) {
                    toastr.error("Servicio no disponible", "Ups!");
                }
            }
        });
    }

    //ADD TO CART
    $('#tabla').on('dblclick', 'tr', function () {
        var fila = tabla.row(this).data();
        articulo = fila[0] + '&' + fila[2] + '&0';
        console.log(articulo);
        refreshCartTable();//Agregar parametros
        return false;
    });

    //REMOVE FROM CART
    $('#tablac').on('click', '#cruzroja', function () {
        var fila = $(this).parents('tr');
        var fila = tablac.row(fila).data();
        opccarrito = 3;
        articulo = fila[0];
        console.log(articulo);
        refreshCartTable(); //Agregar parametros 
        return false;
    });

    /*/Agregar al carrito
    $('#tabla').on('dblclick', 'tr', function () {
        //console.log(tabla.row(fila).data());
        var fila = tabla.row(this).data();
        opccarrito = 2;
        articulo = fila['codigo'] + '&' + fila['marca'] + '&0';
        tablac.ajax.reload();
        return false;
    });

    //Quitar del carrito
    $('#tablac').on('click', '#cruzroja', function () {
        var fila = $(this).parents('tr');
        var fila = tablac.row(fila).data();
        opccarrito = 3;
        articulo = fila['codigo'];
        tablac.ajax.reload();
        return false;
    });*/

    /*function tablacarrito() {
        
        
        tablac = $("#tablac").DataTable({
            "bFilter": false,
            "pageLength": 50,
            "aaSorting": [],
            "bLengthChange": false,
            "language": {
                "emptyTable": "Carrito vacío"
            },
            "responsive": true,
            "ajax": {
                "method": "POST",
                "async": true,
                "url": "./Modelo/DAOPedidos.php",
                "data": function (d) {
                    d.opcpedido = opccarrito;
                    d.articulo = articulo;
                }
            },
            "columns": [
                { "data": "codigo", "width": "40%" },//0 Codigo
                { "data": "marca", "width": "25%" },//1 Marca
                { "data": "cantidad", "width": "25%" },//2 Cantidad
                { "data": "cantidad", "width": "10%" }//3 Quitar               
            ],
            "columnDefs": [
                {
                    "responsivePriority": 2,
                    "targets": [2], //Cantidad
                    "orderable": false,
                    "render": function (data, type, row) {
                        return '<input class="width55 form-control" value=' + row.cantidad + ' type="text">';
                    }
                },
                {
                    "responsivePriority": 0,
                    "targets": [3], //Boton quitar de pedido 
                    "orderable": false,
                    "render": function () {
                        return '<i class="fa fa-times fa-2x rojo" id="cruzroja" aria-hidden="true"></i>';
                    }
                },
            ]
        });
    }*/

    function tablahistcompras() {
        if (tablahc != null) {
            tablahc.ajax.reload();
            return false;
        }
        tablahc = $("#tablahc").DataTable({
            "bFilter": false,
            "pageLength": 10,
            "aaSorting": [],
            "bLengthChange": false,
            "language": {
                "emptyTable": "Historial vacío"
            },
            "responsive": true,
            "ajax": {
                "method": "POST",
                "async": true,
                "url": "./Modelo/DAOPedidos.php",
                "data": function (d) {
                    d.opcpedido = 6;
                }
            },
            "columns": [
                { "data": "fecha", "width": "30%" },
                { "data": "items", "width": "70%" },
            ],
            "order": [[0, 'desc']]
        });
    }


    //BACK TO TOP EN LA PAGINA CUANDO SE PASA A LA SIGUIENTE HOJA
    $('#tabla').on('page.dt', function () {
        $('html, body').animate({
            scrollTop: 300
        }, 300);
    });


});





































