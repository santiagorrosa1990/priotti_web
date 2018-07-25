$(document).ready(function () {

    var coef = 1;
    var tabla = null;
    var tablac = null;
    var tablahc = null;
    var busqueda = "";
    var busquedaux = "";
    var cantidad = 0;
    var timeout = null;
    var confotos = false;
    var onlyOffers = false;
    var onlyNovelties = false;


    //INICIO   

    clickednav($("#productos"));

    //Compruebo sesión existente en recarga de pagina
    checkOnReload();

    //NAV BAR

    //nav bar productos
    $("#productos").on("click", function (e) {
        clickednav($(this));
        togglebotones(true);
        showtablac(false);
        showtablap(true);
        setjumbo("Productos", "Administrador");
        return false;
    });

    $("#clientes").on("click", function (e) {
        clickednav($(this));
        togglebotones(false);
        showtablap(false);
        showtablac(true);
        setjumbo("Clientes", "Administrador");
        return false;
    });

    //SELECTORES

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

    function checkOnReload() {
        if (cookieSessionExist()) {
            setItemTable();
            var username = localStorage.username
            toastr.success("Bienvenido " + username);
            toastr.warning("Contenido editable", "Atención");
            $("#datossesion p").text(username);
            $("#datossesion").removeClass("oculto");
            $("#bofertas").removeClass("oculto");
            $("#productos").removeClass("oculto"); //Mostrar productos
            $("#clientes").removeClass("oculto");  //Mostrar clientes
            showtablap(true);
            setjumbo("Productos", "Administrador");
            viewColumnToggles(true);
            $('#botoncarrito').show();
            //actfechas();
            togglebotones(true);
        } else {
            $("#datosingreso").slideDown(500);
        }
    }

    /*function iniciarsesion(data) {
        if (data.includes('Usuario')) {            
            $("#datosingreso").slideUp();
            $("#datossesion p").text(data);
            $("#datossesion").removeClass("oculto");
            setjumbo("Productos", "Administrador");         
            toastr.success("Bienvenido!");
            toastr.warning("Ojo! =O", "Contenido editable");
            tablaproductos();            
            tablaclientes(); 
            showtablap(true);             
            actfechas();            
            togglebotones(true);
        } else if (data.includes("no iniciada")) {
            $("#datosingreso").slideDown(500);
        } else {
            toastr.error(data, "Error");
        }
    }*/

    //Boton Iniciar Sesion
    $("#entrar").on("click", function (e) {
        login(buildLoginRequest());
        return false;
    });

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

    function cookieSessionExist() {
        return localStorage.token != null;
    }

    function login(data) {
        $.ajax({
            async: false,
            method: "POST",
            url: "http://localhost:4567/adminlogin",
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
                    $("#productos").removeClass("oculto"); //Mostrar productos
                    $("#clientes").removeClass("oculto");  //Mostrar clientes
                    setjumbo("Productos", "Administrador");
                    viewColumnToggles(true);
                    setLocalStorage(data);
                    setItemTable();
                    showtablap(true);
                    //$("#bdescargarlista").removeClass("oculto");
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
        var parsed = parseJwt(data)
        localStorage.token = data;
        localStorage.username = parsed.username;
        localStorage.id = parsed.id;
    }

    //Cerrar Sesion
    $("#salir").on("click", function (e) {
        logout();
    });

    //SELECTORES CLIENTES

    //Checkbox para editar lista de clientes
    $('#checkeditcli').on("click", function () {
        if ($('#checkeditcli').is(':checked')) {
            $('#bnuevocliente').fadeIn("oculto");
            toastr.warning("Modo Editable");
        } else {
            $('#bnuevocliente').fadeOut("oculto");
        }
    });

    //Modificacion de Clientes (sacando tbody del selector funciono el .on "click")
    $('#tablac').on('click', 'tr', function () {
        console.log(tablac.row(this).data());
        if ($('#checkeditcli').is(':checked')) {
            var fila = tablac.row(this).data();
            $.confirm({
                title: 'Editar: ' + fila['nombre'],
                content: '' +
                    '<form class="formName" id="actcliente">' +
                    '<div class="form-group">' +
                    '<label>Nº Cliente(usuario)</label>' +
                    '<input type="text" class="form-control numero" name="numero" value="' + fila['numero'] + '" />' +
                    '<label>Cuit(clave)</label>' +
                    '<input type="text" class="form-control cuit" name="cuit" value="' + fila['cuit'] + '" />' +
                    '<label>Nombre</label>' +
                    '<input type="text" class="form-control nombre" name="nombre" value="' + fila['nombre'] + '" />' +
                    '<label>Coeficiente</label>' +
                    '<input type="text" class="form-control" name="aumento" value="' + fila['porcentajeaumento'] + '" />' +
                    '<label>Email</label>' +
                    '<input type="text" class="form-control" name="email" value="' + fila['email'] + '" />' +
                    '<select name="estado"> <option value="ACTIVO">Activo</option> <option value="INACTIVO">Inactivo</option> </select>' +
                    '</div>' +
                    '</form>',
                buttons: {
                    formSubmit: {
                        text: 'Editar',
                        btnClass: 'btn-blue',
                        action: function () {
                            var nombre = this.$content.find('.nombre').val();
                            var numero = this.$content.find('.numero').val();
                            var cuit = this.$content.find('.cuit').val();
                            if (!nombre || !numero || !cuit) {
                                $.alert('Nombre, numero y cuit no puede ser vacíos');
                                return false;
                            }
                            var datos = $('#actcliente').serialize() + '&opc=1' + '&id=' + fila['id'];
                            $.ajax({
                                method: "POST",
                                url: "../Modelo/DAOClientes.php",
                                data: datos,
                                success: function (data) {
                                    if (data.includes('actualizado')) {
                                        toastr.success(data);
                                        tablac.ajax.reload(null, false);
                                    } else {
                                        toastr.error(data, "Error");
                                    }
                                },
                                error: function () {
                                    toastr.error("No se pudo conectar al servidor", "Error");
                                }
                            });
                        }
                    },
                    cancel: function () {
                        //close
                    },
                }
            });
        }
        return false;
    });

    //Boton para agregar nuevo cliente
    $('#bnuevocliente').on("click", function () {
        $.confirm({
            title: 'Nuevo Cliente: ',
            content: '' +
                '<form class="formName" id="actcliente">' +
                '<div class="form-group">' +
                '<label>Nº Cliente(usuario)</label>' +
                '<input type="text" class="form-control numero" name="numero"/>' +
                '<label>Cuit(clave)</label>' +
                '<input type="text" class="form-control cuit" name="cuit"/>' +
                '<label>Nombre</label>' +
                '<input type="text" class="form-control nombre" name="nombre"/>' +
                '<label>Coeficiente</label>' +
                '<input type="text" class="form-control" name="aumento"/>' +
                '<label>Email</label>' +
                '<input type="text" class="form-control" name="email"/>' +
                '</div>' +
                '</form>',
            buttons: {
                formSubmit: {
                    text: 'Editar',
                    btnClass: 'btn-blue',
                    action: function () {
                        var nombre = this.$content.find('.nombre').val();
                        var numero = this.$content.find('.numero').val();
                        var cuit = this.$content.find('.cuit').val();
                        if (!nombre || !numero || !cuit) {
                            $.alert('Nombre, numero y cuit no puede ser vacíos');
                            return false;
                        }
                        var datos = $('#actcliente').serialize() + '&opc=3';
                        $.ajax({
                            method: "POST",
                            url: "../Modelo/DAOClientes.php",
                            data: datos,
                            success: function (data) {
                                if (data.includes('creado')) {
                                    toastr.success(data);
                                    tablac.ajax.reload();
                                } else {
                                    toastr.error(data, "Error");
                                }
                            },
                            error: function () {
                                toastr.error("No se pudo conectar al servidor", "Error");
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
    });

    //SELECTORES PRODUCTOS 

    $("#bofertas").on("click", function () {
        unpressed();
        $(this).addClass("active btn-info");
        onlyOffers = true;
        onlyNovelties = false;
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
        onlyOffers = false;
        searchItems(busqueda);
        return false;
    });

    //Toggles de las columnas de la tabla de productos
    $('.toggle-vis').on('click', function (e) {
        //e.preventDefault();

        // Get the column API object
        var column = tabla.column($(this).attr('data-column'));

        column.visible(!column.visible());
    });

    //Checkbox para editar lista de productos (equiv y ofertas)
    $('#checkeditprod').on("click", function () {
        if ($('#checkeditprod').is(':checked')) {
            toastr.warning("Lista editable!");
        }
    });

    //Ventana emergente con editor de ofertas y equiv
    $('#tabla').on('click', 'tr', function () {
        console.log(tabla.row(this).data());
        if ($('#checkeditprod').is(':checked')) {
            var fila = tabla.row(this).data();
            $.confirm({
                title: 'Editar: ' + fila['codigo'],
                content: '' +
                    '<form class="formName" id="actproducto">' +
                    '<div class="form-group">' +
                    '<label>Precio Oferta:</label>' +
                    '<input type="text" class="form-control" name="ofe" value="' + fila['precio_oferta'] + '" />' +
                    '<label>Equivalencias:</label>' +
                    '<textarea name="equiv" cols="50" rows="10" class="form-control" type="text">' + fila['info'] + '</textarea>' +
                    '</div>' +
                    '</form>',
                buttons: {
                    formSubmit: {
                        text: 'Aplicar',
                        btnClass: 'btn-blue',
                        action: function () {
                            var datos = $('#actproducto').serialize() + '&opc=1' + '&cod=' + fila['codigo'];
                            $.ajax({
                                method: "POST",
                                url: "../Modelo/DAOProductos.php",
                                data: datos,
                                success: function (data) {
                                    if (data.includes("actualizado")) {
                                        toastr.success(data);
                                        tabla.ajax.reload(null, false);
                                    } else {
                                        toastr.error(data, "Error");
                                    }
                                },
                                error: function () {
                                    toastr.error("No se pudo conectar al servidor", "Error");
                                }
                            });
                        }
                    },
                    cancel: function () {
                        //close
                    },
                }
            });
        }
        return false;
    });

    //boton para mostrar modulo actualizador
    $("#bimportador").on("click", function () {
        if (!$("#importador").is(":visible")) {
            $("#importador").slideDown();
        } else {
            $("#importador").slideUp();
        }
        return false;
    });

    //actualizar todo con aprecios, arubros, alineas.txt
    $("#importarlista").on("click", function () {
        $.confirm({
            title: 'Confirme:',
            content: '¿Actualizar lista de precios?',
            buttons: {
                confirmar: function () {
                    $.ajax({
                        method: "POST",
                        url: "../Modelo/DAOActualizar.php",
                        data: "opc=1",
                        beforeSend: function () {
                            $('#msjprocesando').removeClass('oculto');
                        },
                        complete: function () {
                            $('#msjprocesando').addClass('oculto');
                        },
                        success: function (data) {
                            if (data.includes("actualizada")) {
                                toastr.success(data);
                                actfechas();
                            } else {
                                toastr.error(data, "Error");
                            }
                        },
                        error: function () {
                            toastr.error("Problemas de conexion", "Error");
                        }
                    });
                },
                cancelar: function () {
                    //$.alert('Canceled!');
                }
            }
        });
        return false;
    });

    //actualizar ofertas con ofertas.txt
    $("#importarofertas").on("click", function () {
        $.confirm({
            title: 'Confirme:',
            content: '¿Actualizar ofertas?',
            buttons: {
                confirmar: function () {
                    $.ajax({
                        method: "POST",
                        url: "../Modelo/DAOActualizar.php",
                        data: "opc=2",
                        success: function (data) {
                            if (data.includes("Faltan")) {
                                toastr.success(data, "Ofertas actualizadas");
                                actfechas();
                            } else { toastr.error(data, "Error"); }
                        },
                        error: function () {
                            toastr.error("Problemas de conexion", "Error");
                        }
                    });
                },
                cancelar: function () {
                    //$.alert('Canceled!');
                }
            }
        });
        return false;
    });


    $('#upload').on('click', function () {
        subirarchivo();
    });

    //Boton descargar lista .xlsx
    $("#bdescargarlista").on("click", function () {
        descargarxlsx();
        return false;
    });

    //FUNCION DATATABLES

    function setItemTable() {
        if (localStorage.token != null) {
            renderFullItemTable();
        }
    }

    function renderFullItemTable() {
        if (tabla == null) {
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
                        }
                    ],
            });
        }
        searchItems(busqueda);
    }

    function searchItems(keywords) {
        var request = buildItemRequest(keywords);
        console.log(request);
        var uri;
        if (localStorage.token != null) {
            uri = "http://localhost:4567/item/full";
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
            novelty: onlyNovelties
        }
        return JSON.stringify(request);
    }

    function tablaclientes() {
        if (tablac == null) {
            tablac = $("#tablac").DataTable({
                "responsive": true,
                "language": {
                    "emptyTable": "No hay coincidencias",
                    "info": "Mostrando _START_ a _END_ de _TOTAL_ resultados",
                    "infoEmpty": "No hay resultados",
                    //"infoFiltered": "(filtered from _MAX_ total entries)",
                    //"infoPostFix": "",
                    //"thousands": ",",
                    "lengthMenu": "Mostrar _MENU_ por hoja",
                    "loadingRecords": "Cargando...",
                    "processing": "Procesando...",
                    //"search": "Search:",
                    //"zeroRecords": "No matching records found",
                    "paginate": {
                        "first": "First",
                        "last": "Last",
                        "next": "Siguiente",
                        "previous": "Anterior"
                    },
                },
                "ajax": {
                    "method": "POST",
                    "async": true,
                    "url": "../Modelo/DAOClientes.php",
                    "data": function (d) {
                        d.opc = 2;
                    }
                },
                "columns": [
                    { "data": "id" },
                    { "data": "nombre" },
                    { "data": "numero" },
                    { "data": "cuit" },
                    { "data": "email" },
                    { "data": "porcentajeaumento" },
                    { "data": "ultimo" },
                    { "data": "visitas" },
                    { "data": "estado" }
                ],
                "columnDefs": [
                    {
                        "targets": [0],
                        "visible": false,
                        "searchable": false
                    },
                    {
                        "targets": [5],
                        "searchable": false
                    },
                    {
                        "targets": [6],
                        "searchable": true
                    },
                    {
                        "targets": [7],
                        "searchable": false
                    },
                    {
                        "targets": [8],
                        "searchable": false
                    }
                ],
                "order": [[1, 'asc']]
            });
        }
    }

    //FUNCIONES

    function showtablac(op) {
        if (op === true) {
            $("#tablaclientes").fadeIn();
        } else {
            $("#tablaclientes").hide();
        }
    }

    function showtablap(op) {
        if (op) {
            $("#tablaproductos").fadeIn();
        } else {
            $("#tablaproductos").hide();
        }
    }

    function unpressed() {
        $("#btodos").removeClass("active btn-info");
        $("#bofertas").removeClass("active btn-info");
        $("#bnovedades").removeClass("active btn-info");
    }

    function logout() {
        clearLocalStorage();
        viewColumnToggles(false);
        unpressed();
        $("#datossesion").addClass("oculto");
        $("#bofertas").addClass("oculto");
        //$("#bdescargarlista").addClass("oculto");
        $("#datossesion p").text("");
        $("#datosingreso").slideDown(500);
        $("#usuario").val("");
        $("#clave").val("");
        $('#checkeditprod').prop("checked", false);
        $("#productos").addClass("oculto");
        $("#clientes").addClass("oculto");
        $("#importador").hide();
        showtablac(false);
        showtablap(false);
        setjumbo('Módulo Administrador', '');
        togglebotones(false);
        toastr.info("Se cerró sesión");
        //$('#clientes').addClass('oculto');
        //botoncarrito(false);//Saco el boton de carrito
        //toggleprecios();
        //toggleCarrito(false);
        //vertogglescolumnas(false);
        //resettogglescolumnas();
    }

    function clearLocalStorage() {
        localStorage.clear();
    }

    function cerrarsesion() {
        $.ajax({
            method: "POST",
            url: "../Controlador/ControlSesion.php",
            data: "opc=3",
            success: function (data) {
                if (data.includes('cerrada')) {
                    $("#datossesion").addClass("oculto");
                    showtablac(false);
                    showtablap(false);
                    setjumbo('Módulo Administrador', '');
                    togglebotones(false);
                    $("#importador").hide();
                    $('#checkeditprod').prop("checked", false);
                    $("#datossesion p").text("");
                    $("#datosingreso").slideDown(500);
                    $("#usuario").val("");
                    $("#clave").val("");
                    $("#productos").addClass("oculto");
                    $("#clientes").addClass("oculto");
                    toastr.info("Se cerró sesión");
                }
            }
        });
    }

    function descargarxlsx() {
        $.ajax({
            method: "POST",
            url: "../Modelo/DAOProductos.php",
            data: "opc=5",
            async: false,
            success: function (data) {
                if (data.includes('listapriotti')) {
                    data = data.trim();
                    toastr.success("Descargando...", "Lista generada");
                    var path = '../Resources/uploads/' + data + '.xlsx';
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

    //fechas de act lista y ofertas
    function actfechas() {
        $.ajax({
            method: "POST",
            url: "../Modelo/DAOActualizar.php",
            data: "opc=3",
            success: function (data) {
                data = JSON.parse(data);
                $('#ultimaoferta').text(' ' + data[0]);
                $('#ultimalista').text(' ' + data[1]);
            },
            error: function () {
                toastr.error("Problemas de conexion", "Error");
            }
        });
    }

    function cargarofertas() {
        var file_data = $('#file').prop('files')[0];
        var form_data = new FormData();
        form_data.append('file', file_data);
        $.ajax({
            url: '../Modelo/Importador.php', // point to server-side PHP script 
            dataType: 'text', // what to expect back from the PHP script
            cache: false,
            contentType: false,
            processData: false,
            data: form_data,
            type: 'post',
            success: function (response) {
                $('#msg').html(response); // display success response from the PHP script
            },
            error: function (response) {
                $('#msg').html(response); // display error response from the PHP script
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
        }
    }

    function toggleequiv() {
        if (tablaexiste()) {
            var column = tabla.column(4);
            column.visible(!column.visible());
        }
    }

    function resettogglescolumnas() {
        $('#fotos').prop('checked', false);
        $('#aplicacion').prop('checked', true);
        $('#marca').prop('checked', true);
        $('#rubro').prop('checked', true);
        $('#equivalencias').prop('checked', false);
    }

    function viewColumnToggles(op) {
        if (op == true) {
            resettogglescolumnas();
            $('#togglera').show();
        } else {
            $('#togglera').hide();
        }
    }

    function togglefotos() {
        if (tablaexiste()) {
            confotos = !confotos;
            tabla.ajax.reload();
        }
    }

    function tablaexiste() {
        if (tabla != null) {
            return true;
        } else {
            return false
        }
    }

    function subirarchivo() {
        var file_data = $('#file').prop('files')[0];
        var form_data = new FormData();
        form_data.append('file', file_data);
        $.ajax({
            url: '../Modelo/Importador.php', // point to server-side PHP script 
            dataType: 'text', // what to expect back from the PHP script
            cache: false,
            contentType: false,
            processData: false,
            data: form_data,
            type: 'post',
            success: function (response) {
                $('#msg').html(response); // display success response from the PHP script
            },
            error: function (response) {
                $('#msg').html(response); // display error response from the PHP script
            }
        });
    }

    function checkreload() {
        $.ajax({
            method: "POST",
            url: "../Controlador/ControlSesion.php",
            data: "opc=5",
            success: function (data) {
                if (data.includes("otra sesión")) {
                    toastr.error(data);
                } else {
                    resettogglescolumnas();
                    iniciarsesion(data);
                }
            },
            error: function () {
                alert("error de servidor");
            }
        });
    }

    function setjumbo(dis, subdis) {
        $(".jumbotron #titulo").fadeOut();
        $(".jumbotron #subtitulo").fadeOut();
        $(".jumbotron #titulo").text(dis);
        $(".jumbotron #subtitulo").text(subdis);
        $(".jumbotron #titulo").fadeIn();
        $(".jumbotron #subtitulo").fadeIn();
    }

    //muestra u oculta los botones de productos
    function togglebotones(op) {
        if (op === true) {
            $("#botonesprod").fadeIn();
        } else {
            $("#botonesprod").fadeOut();
        }
    }

    //clickea los botones del nav
    function clickednav(sel) {
        $('#productos').removeClass('amarillo');
        $('#empresa').removeClass('amarillo');
        $('#clientes').removeClass('amarillo');
        $('#contacto').removeClass('amarillo');
        sel.addClass('amarillo');
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
        "extendedTimeOut": "100",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }

    //BACK TO TOP EN LA PAGINA CUANDO SE PASA A LA SIGUIENTE HOJA
    $('#tablac').on('page.dt', function () {
        $('html, body').animate({
            scrollTop: 300
        }, 300);
    });

    $('#tabla').on('page.dt', function () {
        $('html, body').animate({
            scrollTop: 300
        }, 300);
    });








});





































