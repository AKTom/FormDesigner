/// <reference path="jquery-1.8.3-vsdoc.js" />
/// <reference path="BasicControl.js" />

var phone_x, phone_y, phone_width, phone_height;
var tcon_x, tcon_y, tcon_width, tcon_height;
var delbtn_x, delbtn_y, delbtn_width, delbtn_height;
var drag_x = 0, drag_y = 0;
var IsDrag = false, IsOver = false, IsChangeSize = false;
//当前改变大小的控件
var _ChangeSizeCon = null;
//当前改变大小的最终大小
var _ChangeSize_FinalNum = -1;
//当前改变大小用到改变的按钮类型
var _ChangeSize_Btn = ChangeSizeBtnType.None;
//自加ID
var SysControl_Id = 1;
//正在改变浏览器大小
var IsBodyChangeSize = false;

//新增日期的format方法
Date.prototype.format = function (format) {
    var o = {
        "M+": this.getMonth() + 1, //month
        "d+": this.getDate(), //day
        "h+": this.getHours(), //hour
        "m+": this.getMinutes(), //minute
        "s+": this.getSeconds(), //second
        "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
        "S": this.getMilliseconds() //millisecond
    }
    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        }
    }
    return format;
}

//元素操作及常用工具类
ToolHandle = {
    //所有已经拖上去的控件集合
    List: [],
    //根据Id值获取元素
    GetControl: function (id) {
        for (var i = 0; i < ToolHandle.List.length; i++) {
            if (ToolHandle.List[i].Id == id) {
                return ToolHandle.List[i];
            }
        }
    },
    GetActiveControl: function () {
        var tempControl = $(".Div_SelectControl").children("[class*='Control_']");
        if (!tempControl) throw ("未查询到当前激活的控件。");
        var tempControl_Id = tempControl.attr("index");
        if (!tempControl_Id) throw ("未查询到当前激活的控件Id。");
        return ToolHandle.GetControl(tempControl_Id);
    },
    //获取某控件的所有子控件
    GetChildrenControls: function (id) {
        var t_parent_controls = [];
        if (!id) {
            for (var o = 0; o < ToolHandle.List.length; o++) {
                if (ToolHandle.List[o].ParentId == "") {
                    t_parent_controls.push(ToolHandle.List[o]);
                }
            }
        } else {
            for (var o = 0; o < ToolHandle.List.length; o++) {
                if (id.toString() == ToolHandle.List[o].ParentId.toString()) {
                    t_parent_controls.push(ToolHandle.List[o]);
                }
            }
        }
        return t_parent_controls;
    },
    //删除元素
    RemoveOfId: function (id) {
        for (var i = 0; i < ToolHandle.List.length; i++) {
            if (ToolHandle.List[i].Id == id) {
                $(ToolHandle.List[i].Me).remove();
                ToolHandle.List.splice(i, 1);
            }
        }
    },
    //点击按钮删除控件
    RemoveConOfButton: function (con) {
        var id = $(con).parent().children(".Div_LineControl,.Div_ControlGroup").attr("index");
        ToolHandle.RemoveOfId(id);
    },
    //恢复控件体积
    RecoveryOfCon: function (con) {
        var _index = ToolHandle.GetControl($(con).parent().children(".Div_LineControl,.Div_ControlGroup").eq(0).attr("index"));
        var _Control1 = _index.CloneMe.children(".Div_LineControl,.Div_ControlGroup");
        var _Control2 = $(con).parent().children(".Div_LineControl,.Div_ControlGroup");
        var _ControlType = _Control1[0].classList[1].toLowerCase();
        switch (_ControlType) {
            case "control_textarea":
                _Control1.css("height", "100px");
                _Control2.css("height", "100px");
                break;
            default:
        }
    },
    //【完全没法用】获取所有的控件响应大小
    GetPanel: function () {
        throw ("还没写好。");
        $(".Div_LineControl,.Div_ControlGroup").each(function () {
            var x = $(this).offset().left + phone_x;
            var y = $(this).offset().top + phone_y;
            var width = $(this).innerWidth();
            var height = $(this).innerHeight();
            $("body").append("<div class='LocationDiv' style='width:" + width + "px;height:" + height + "px;left:" + x + "px;top:" + y + "px;'></div>");
        });
    },
    //更新对象的属性Me
    UpdateMe: function (obj, c) {
        obj.CloneMe = obj.Me;
        obj.Me = c;
    },
    //获取新的GUID
    GetGUID: function () {
        var s = [];
        var hexDigits = "0123456789ABCDEF";
        for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "-";

        var uuid = s.join("");
        return uuid;
    },
    //获取格式化的日期时间
    GetDate: function (format) {
        var now = new Date();
        return now.format(!format ? "yyyy-MM-dd hh:mm:ss" : format);
    },
    SetDrag_Down: function (e) {
        IsChangeSize = true;
        _ChangeSizeCon = e.currentTarget.parentNode.childNodes[1];
        _ChangeSizeCon.style.height = $(_ChangeSizeCon).height() + "px";
        _ChangeSize_FinalNum = -1;
        switch (e.currentTarget.classList[0].toLowerCase()) {
            case "dragdown":
                _ChangeSize_Btn = ChangeSizeBtnType.Down;
                break;
        }
    },
    SetDrag_Move: function (e) {
        try {
            if (IsChangeSize) {
                if (_ChangeSize_Btn != ChangeSizeBtnType.None) {
                    switch (_ChangeSize_Btn) {
                        case ChangeSizeBtnType.Down:
                            var Page_Y = e.pageY;
                            if (Page_Y == 0) Page_Y = e.changedTouches[0].pageY;
                            var _tempNum = Page_Y - ToolHandle.GetNodeTop(_ChangeSizeCon) - 10;
                            //吸附高度（50的倍数
                            if (_tempNum <= 50) {
                                _ChangeSize_FinalNum = 50;
                                _ChangeSizeCon.style.height = "50px";
                            } else if (_tempNum % 50 < 10) {
                                _ChangeSize_FinalNum = _tempNum - _tempNum % 50;
                                _ChangeSizeCon.style.height = _ChangeSize_FinalNum + "px";
                            } else if ((_tempNum + 10) % 50 - 10 < 10) {
                                _ChangeSize_FinalNum = _tempNum - ((_tempNum + 10) % 50 - 10);
                                _ChangeSizeCon.style.height = _ChangeSize_FinalNum + "px";
                            } else {
                                _ChangeSize_FinalNum = _tempNum;
                                _ChangeSizeCon.style.height = _tempNum + "px";
                            }
                            document.getElementsByName("height")[0].value = parseInt(_ChangeSizeCon.style.height);
                            e.stopPropagation();
                            break;
                        default:
                    }
                }
            }
        } catch (e) {
            console.log(e);
        }
    },
    SetDrag_Up: function (e) {
        if (_ChangeSize_FinalNum != -1 && !!_ChangeSizeCon) {
            var _con = ToolHandle.GetControl($(_ChangeSizeCon).attr("index"));
            _con.CloneMe.children(".Div_LineControl,.Div_ControlGroup").css("height", _ChangeSize_FinalNum);
            _ChangeSize_FinalNum = -1;
            _ChangeSize_Btn = ChangeSizeBtnType.None;
        }
        IsChangeSize = false;
    },
    //获取元素纵坐标
    GetNodeTop: function (e) {
        var offset = e.offsetTop;
        //offset += e.clientTop;
        if (e.offsetParent != null) offset += ToolHandle.GetNodeTop(e.offsetParent);
        return offset;
    },
    //获取元素横坐标
    GetNodeLeft: function (e) {
        var offset = e.offsetLeft;
        //offset += e.clientTop;
        if (e.offsetParent != null) offset += ToolHandle.GetNodeLeft(e.offsetParent);
        return offset;
    },
    //正在改变浏览器大小
    ChangeFormSize: function (e) {
        if (!IsBodyChangeSize) {
            IsBodyChangeSize = true;
            var _isChangeSize = setTimeout(function () {
                phone_x = Div_Phone.offset().left;
                phone_y = Div_Phone.offset().top;
                phone_width = Div_Phone.innerWidth();
                phone_height = Div_Phone.innerHeight();

                delbtn_x = phone_x + phone_width / 4;
                delbtn_y = phone_y + 10;
                delbtn_width = Div_DelControl.innerWidth();
                delbtn_height = Div_DelControl.innerHeight();

                IsBodyChangeSize = false;
                if (!!_isChangeSize) {
                    clearTimeout(_isChangeSize);
                    _isChangeSize = null;
                }
            }, "300");
        }
    },
    //导出Json格式数据
    ExportJson: function () {
        var allcontrols = $("#Div_Phone_Main > .BasicControl").children("[class*='Control_']");
        var controllist = [];
        for (var i = 0; i < allcontrols.length; i++) {
            var tempcontrol = ToolHandle.GetControl(allcontrols.eq(i).attr("index"));
            var tempobj = {};
            for (items in tempcontrol) {
                switch (Object.prototype.toString.call(tempcontrol[items])) {
                    case "[object Object]":
                    case "[object Function]":
                        break;
                    default:
                        tempobj[items] = tempcontrol[items];
                }
            }
            for (var property in tempcontrol.Property) {
                tempobj[property] = tempcontrol.Property[property];
            }
            controllist.push(tempobj);
        }
        return controllist;
    },
    /*根据模板获取变量*/
    GetTemplate: function (html, options) {
        var re = /<%([^%>]+)?%>/g, reExp = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g, code = 'var r=[];\n', cursor = 0;
        var add = function (line, js) {
            js ? (code += line.match(reExp) ? line + '\n' : 'r.push(' + line + ');\n') :
                (code += line != '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : '');
            return add;
        }
        while (match = re.exec(html)) {
            add(html.slice(cursor, match.index))(match[1], true);
            cursor = match.index + match[0].length;
        }
        add(html.substr(cursor, html.length - cursor));
        code += 'return r.join("");';
        return new Function(code.replace(/[\r\t\n]/g, '')).apply(options);
    }
};

$(function () {

    $("#Div_Phone_Main").on('mouseover', ".BasicControl", function (e) {
        $(this).addClass("EditFrameShow");
        e.stopPropagation();
    }).on('mouseout', ".BasicControl", function (e) {
        $(this).removeClass("EditFrameShow");
        e.stopPropagation();
    }).on('mousedown', ".BasicControl", function (e) {
        for (var i = 0; i < ToolHandle.List.length; i++) {
            var meid = $(this).children("[class*='Control_']").attr("index");
            if (ToolHandle.List[i].Id != meid) {
                ToolHandle.List[i].Me.removeClass("Div_SelectControl");
            } else {
                $(this).addClass("Div_SelectControl");
                var _property = ToolHandle.GetControl(meid);

                $(".div_PropertyPanel").html(ToolHandle.GetTemplate('<a href="#"><%this.Id%></a>', _property));
            }
        }

        e.stopPropagation();
    });

    $("#Div_Phone").on('mousedown', "#Div_Phone_Main", function (e) {
        for (var i = 0; i < ToolHandle.List.length; i++) {
            ToolHandle.List[i].Me.removeClass("Div_SelectControl");
        }
        e.stopPropagation();
    });



    //$("#BugDiv").resizable({
    //    grid: [0, 10],
    //    handles: 's'
    //});

    //$(document.body).mousedown(function () { ToolControl.SetSelectControl(null); });

    Div_Phone = $('#Div_Phone_Main');
    phone_x = Div_Phone.offset().left;
    phone_y = Div_Phone.offset().top;
    phone_width = Div_Phone.innerWidth();
    phone_height = Div_Phone.innerHeight();

    Div_DelControl = $('#Div_DeleteControl');
    delbtn_x = phone_x + phone_width / 4;
    delbtn_y = phone_y + 10;
    delbtn_width = Div_DelControl.innerWidth();
    delbtn_height = Div_DelControl.innerHeight();


    var TempDragControl = null;
    //用来判明拖拽控件结束时应该的操作
    var TempLocationType = null;
    //用来临时装载控件的父控件
    var TempParentControl = null;
    //之前的父控件ID
    var OldParentControl = null;
    //当前拖拽的控件
    var Me = null;
    var SplitHr = $("#SplitHr").clone();
    //所有第一级控件
    var main_controls = [];

    var tempmax_y = 0, tempmin_y = 0;

    //****************************************************
    //为新添加的控件加上拖拽效果 【Start】
    //****************************************************
    //默认拖拽效果
    var DefaultDraggable = {
        scroll: true,
        opacity: 0.6,
        zIndex: 999,
        helper: function (e) {
            var temp_e = $("#" + e.currentTarget.classList[1].toString().substr(7)).clone();
            temp_e.addClass("GrayBackground");
            temp_e.css({
                width: "100px",
                zIndex: "99999",
                fontFamily: 'Microsoft YaHei'
            });
            return temp_e;
        },
        cursor: "cell",
        cursorAt: { top: 20, left: 50 },
        distance: 10,
        start: function (e) {
            ToolControl.SetSelectControl(null);
            $(e.target).addClass("BlurControl");
            IsDrag = true;
            for (var i = 0; i < ToolHandle.List.length; i++) {
                if (ToolHandle.List[i].Id == $(e.currentTarget).attr("index")) {
                    TempDragControl = ToolHandle.List[i].Me.clone();
                    TempDragControl.children(".ToolItem").remove();
                    OldParentControl = ToolHandle.GetControl(ToolHandle.List[i].ParentId);
                    //TempDragControl = ToolHandle.List[i].CloneMe;
                    break;
                }
            }
            TempLocationType = LocationType.None;
            TempParentControl = null;
            Me = ToolHandle.GetControl($(e.target).attr("index"));
        }, stop: function (e) {
            if (IsDrag) {
                if (TempLocationType == LocationType.Delete) {
                    Me.Me.remove();
                    ToolHandle.RemoveOfId(Me.Id);
                } else {
                    Me.Me.remove();
                    $(SplitHr).after(TempDragControl);
                    SplitHr.remove();
                    TempDragControl.children().removeClass("BlurControl");
                    TempDragControl.removeClass("EditFrameShow");

                    TempDragControl.children().eq(0).draggable(DefaultDraggable);
                    var _con = ToolHandle.GetControl(TempDragControl.children().eq(0).attr("index"));
                    _con.Me = TempDragControl;
                    var _con_controls = ToolHandle.GetChildrenControls(_con.Id);
                    for (var i = 0; i < _con_controls.length; i++) {
                        _con_controls[i].Me = TempDragControl.find("[index='" + _con_controls[i].Id + "']");
                        _con_controls[i].Me.draggable(DefaultDraggable);
                        _con_controls[i].Me = _con_controls[i].Me.parent();
                    }
                    //如果自己的父控件不等于当前的父控件的话
                    //if (!TempParentControl && OldParentControl) {
                    //    ToolHandle.GetControl($(e.target).attr("index")).ParentId = !TempParentControl ? "" : TempParentControl.Id;
                    //var _oldcon_controls = ToolHandle.GetChildrenControls(OldParentControl.Id);
                    //for (var i = 0; i < _oldcon_controls.length; i++) {
                    //    if (_oldcon_controls[i].Id == _con.Id) {
                    //        _oldcon_controls[i].ParentId = !TempParentControl ? "" : TempParentControl.Id;
                    //    }
                    //}
                    //}
                    Me.ParentId = !TempParentControl ? "" : TempParentControl.Id;
                    //if (TempParentControl) {
                    //    var _tempcon_controls = ToolHandle.GetChildrenControls(TempParentControl.Id);
                    //    _con.ParentId = TempParentControl.Id;
                    //    for (var i = 0; i < _tempcon_controls.length; i++) {
                    //        _tempcon_controls[i].Me = _con.Me;
                    //        //TempParentControl.Controls[i].Me.children().eq(0).draggable(DefaultDraggable);
                    //    }
                    //}
                    Me = null;
                }
                TempDragControl = null;
                TempParentControl = null;
                IsDrag = false;

            } else {
                $(this).children().removeClass("BlurControl");
                $(this).removeClass("EditFrameShow");
            }
            //重新计算出所有第一级控件
            ToolHandle.GetChildrenControls();
        }, drag: function (e) {
            if (IsDrag) {
                var Page_X = e.pageX, Page_Y = e.pageY;
                if (Page_X > phone_x && Page_Y > phone_y - 20 && Page_X < phone_x + phone_width && Page_Y < phone_y + phone_height) {
                    TempLocationType = LocationType.None;
                    //移动到内部的时候
                    //if (Page_X >= delbtn_x && Page_Y >= delbtn_y && Page_X <= delbtn_x + delbtn_width && Page_Y <= delbtn_y + delbtn_height) {
                    //    Div_DelControl.addClass("DeleteControl_Ok");
                    //    SplitHr.remove();
                    //    TempLocationType = LocationType.Delete;
                    //    return;
                    //} else {
                    //    if (Div_DelControl.hasClass("DeleteControl_Ok")) Div_DelControl.removeClass("DeleteControl_Ok");
                    //}
                    if (ToolHandle.List.length == 0) {
                        $(Div_Phone).append(SplitHr);
                    } else {
                        tempmax_y = 0;
                        tempmin_y = phone_y;
                        TempParentControl = null;
                        for (var i = 0; i < main_controls.length; i++) {
                            tcon_x = main_controls[i].Me.offset().left;
                            tcon_y = main_controls[i].Me.offset().top;
                            tcon_width = main_controls[i].Me.innerWidth();
                            tcon_height = main_controls[i].Me.innerHeight();
                            if (tcon_y <= tempmin_y + 10) tempmin_y = tcon_y + 10;
                            if (tcon_y + tcon_height + 10 >= tempmax_y) tempmax_y = tcon_y + tcon_height + 10;
                            //光标在元素内部
                            if (Page_Y > tcon_y && Page_Y < tcon_y + tcon_height + 12) {
                                //控件内能容纳其他控件且不是自己
                                if (main_controls[i].HasControl && main_controls[i].Id != Me.Id && !Me.IsRootControl) {
                                    //
                                    if (Page_Y > tcon_y + 10 && Page_Y < tcon_y + tcon_height + 12) {
                                        //设置父控件
                                        TempParentControl = main_controls[i];
                                        tempmax_y_2 = 0;
                                        tempmin_y_2 = 0;
                                        parent_controls = ToolHandle.GetChildrenControls(main_controls[i].Id);

                                        //如果没有子控件就直接加到父控件内部
                                        if (parent_controls == 0) {
                                            SplitHr.remove();
                                            main_controls[i].Me.children(".Div_ControlGroup").append(SplitHr);
                                            break;
                                        }
                                        //这里开始！首先遍历这个控件的所有子控件
                                        for (var o = 0; o < parent_controls.length; o++) {
                                            tcon_x_2 = parent_controls[o].Me.offset().left;
                                            tcon_y_2 = parent_controls[o].Me.offset().top;
                                            tcon_width_2 = parent_controls[o].Me.innerWidth();
                                            tcon_height_2 = parent_controls[o].Me.innerHeight();
                                            if (tcon_y_2 < tempmin_y_2 - 10) tempmin_y_2 = tcon_y_2 - 10;
                                            if (tcon_y_2 + tcon_height_2 + 10 > tempmax_y_2) tempmax_y_2 = tcon_y_2 + tcon_height_2 + 10;

                                            //光标在元素内部
                                            if (Page_Y > tcon_y_2 && Page_Y < tcon_y_2 + tcon_height_2 + 12) {
                                                //光标在元素上半部分
                                                if (Page_Y < tcon_y_2 + tcon_height_2 / 2 + 1) {
                                                    SplitHr.remove();
                                                    parent_controls[o].Me.before(SplitHr);
                                                    break;
                                                    //光标在元素下半部分
                                                } else if (Page_Y > tcon_y_2 + tcon_height_2 / 2 - 1) {
                                                    SplitHr.remove();
                                                    parent_controls[o].Me.after(SplitHr);
                                                    break;
                                                }
                                            } else if (o == parent_controls.length - 1) {
                                                if (Page_Y > tempmax_y_2) {
                                                    SplitHr.remove();
                                                    main_controls[i].Me.children(".Div_ControlGroup").append(SplitHr);
                                                    break;
                                                } else if (Page_Y < tempmin_y_2) {
                                                    SplitHr.remove();
                                                    main_controls[i].Me.children(".Div_ControlGroup").prepend(SplitHr);
                                                    break;
                                                } else {
                                                    //debugger;
                                                }
                                            } else {
                                                //debugger;
                                            }
                                        }
                                        break;
                                    } else {
                                    }
                                }
                                //光标在元素上半部分
                                if (Page_Y < tcon_y + tcon_height / 2 + 1) {
                                    SplitHr.remove();
                                    main_controls[i].Me.before(SplitHr);
                                    break;
                                    //光标在元素下半部分
                                } else if (Page_Y > tcon_y + tcon_height / 2 - 1) {
                                    SplitHr.remove();
                                    main_controls[i].Me.after(SplitHr);
                                    break;
                                }
                                //排除其他所有情况则直接添加到界面最后部分（或者最开始的部分
                            } else if (i == main_controls.length - 1) {
                                if (Page_Y > tempmax_y) {
                                    SplitHr.remove();
                                    Div_Phone.append(SplitHr);
                                    break;
                                } else if (Page_Y < tempmin_y) {
                                    SplitHr.remove();
                                    Div_Phone.prepend(SplitHr);
                                    break;
                                } else {
                                    //debugger;
                                }
                            } else {
                                //debugger;
                            }
                        }
                    }
                } else {
                    //移动到外部的时候
                    SplitHr.remove();
                    TempParentControl = null;
                    TempLocationType = LocationType.Delete;
                }
            }
        }
    };
    //****************************************************
    //为新添加的控件加上拖拽效果 【End】
    //****************************************************


    //****************************************************
    //添加新控件 【Start】
    //****************************************************
    $(".ToolItem:not(.ToolItem_IsDisabled)").draggable({
        scroll: true,
        opacity: 0.8,
        zIndex: 999,
        cursor: "cell",
        cursorAt: { top: 20, left: 50 },
        helper: function (e) {
            var temp_e = $(e.currentTarget).clone();
            //temp_e.removeClass("ui-draggable");
            //temp_e.removeClass("ui-draggable-handle");
            temp_e.css({
                width: "100px",
                zIndex: "9999",
                fontFamily: 'Microsoft YaHei'
            });
            temp_e.addClass("GrayBackground");
            return temp_e;
        },
        start: function (e) {
            IsDrag = true;
            TempDragControl = $("#TempTool" + e.currentTarget.id).parent().clone();
            SplitHr = $("#SplitHr").clone();
            TempParentControl = null;
        },
        drag: function (e) {
            var Page_X = e.pageX, Page_Y = e.pageY;
            if (IsDrag) {
                //光标在内部的时候
                if (Page_X > phone_x && Page_Y > phone_y - 20 && Page_X < phone_x + phone_width && Page_Y < phone_y + phone_height) {
                    if (ToolHandle.List.length == 0) {
                        $(Div_Phone).append(SplitHr);
                    } else {
                        tempmax_y = 0;
                        tempmin_y = phone_y;
                        TempParentControl = null;
                        main_controls = ToolHandle.GetChildrenControls();
                        for (var i = 0; i < main_controls.length; i++) {
                            tcon_x = main_controls[i].Me.offset().left;
                            tcon_y = main_controls[i].Me.offset().top;
                            tcon_width = main_controls[i].Me.innerWidth();
                            tcon_height = main_controls[i].Me.innerHeight();
                            if (tcon_y <= tempmin_y + 10) tempmin_y = tcon_y + 10;
                            if (tcon_y + tcon_height + 10 >= tempmax_y) tempmax_y = tcon_y + tcon_height + 10;
                            //光标在元素内部
                            if (Page_Y > tcon_y && Page_Y < tcon_y + tcon_height + 12) {
                                //控件内能容纳其他控件且不是自己
                                if (main_controls[i].HasControl && main_controls[i].Id != $(e.target).attr("index")) {

                                    if (Page_Y > tcon_y + 10 && Page_Y < tcon_y + tcon_height + 12) {
                                        //设置父控件
                                        TempParentControl = main_controls[i].Id.toString();
                                        tempmax_y_2 = 0;
                                        tempmin_y_2 = 0;
                                        parent_controls = ToolHandle.GetChildrenControls(main_controls[i].Id);

                                        //如果没有子控件就直接加到父控件内部
                                        if (parent_controls == 0) {
                                            SplitHr.remove();
                                            main_controls[i].Me.children(".Div_ControlGroup").append(SplitHr);
                                            break;
                                        }
                                        //这里开始！首先遍历这个控件的所有子控件
                                        for (var o = 0; o < parent_controls.length; o++) {
                                            tcon_x_2 = parent_controls[o].Me.offset().left;
                                            tcon_y_2 = parent_controls[o].Me.offset().top;
                                            tcon_width_2 = parent_controls[o].Me.innerWidth();
                                            tcon_height_2 = parent_controls[o].Me.innerHeight();
                                            if (tcon_y_2 < tempmin_y_2 - 10) tempmin_y_2 = tcon_y_2 - 10;
                                            if (tcon_y_2 + tcon_height_2 + 10 > tempmax_y_2) tempmax_y_2 = tcon_y_2 + tcon_height_2 + 10;

                                            //光标在元素内部
                                            if (Page_Y > tcon_y_2 && Page_Y < tcon_y_2 + tcon_height_2 + 12) {
                                                //光标在元素上半部分
                                                if (Page_Y < tcon_y_2 + tcon_height_2 / 2 + 1) {
                                                    SplitHr.remove();
                                                    parent_controls[o].Me.before(SplitHr);
                                                    break;
                                                    //光标在元素下半部分
                                                } else if (Page_Y > tcon_y_2 + tcon_height_2 / 2 - 1) {
                                                    SplitHr.remove();
                                                    parent_controls[o].Me.after(SplitHr);
                                                    break;
                                                }
                                            } else if (o == parent_controls.length - 1) {
                                                if (Page_Y > tempmax_y_2) {
                                                    SplitHr.remove();
                                                    main_controls[i].Me.children(".Div_ControlGroup").append(SplitHr);
                                                    break;
                                                } else if (Page_Y < tempmin_y_2) {
                                                    SplitHr.remove();
                                                    main_controls[i].Me.children(".Div_ControlGroup").prepend(SplitHr);
                                                    break;
                                                } else {
                                                    //debugger;
                                                }
                                            } else {
                                                //debugger;
                                            }
                                        }
                                        break;
                                    } else {
                                    }
                                }
                                //光标在元素上半部分
                                if (Page_Y < tcon_y + tcon_height / 2 + 1) {
                                    SplitHr.remove();
                                    main_controls[i].Me.before(SplitHr);
                                    break;
                                    //光标在元素下半部分
                                } else if (Page_Y > tcon_y + tcon_height / 2 - 1) {
                                    SplitHr.remove();
                                    main_controls[i].Me.after(SplitHr);
                                    break;
                                }
                                //排除其他所有情况则直接添加到界面最后部分（或者最开始的部分
                            } else if (i == main_controls.length - 1) {
                                if (Page_Y > tempmax_y) {
                                    SplitHr.remove();
                                    Div_Phone.append(SplitHr);
                                    break;
                                } else if (Page_Y < tempmin_y) {
                                    SplitHr.remove();
                                    Div_Phone.prepend(SplitHr);
                                    break;
                                } else {
                                    //debugger;
                                }
                            } else {
                                //debugger;
                            }
                        }
                    }
                } else { TempLocationType = LocationType.None; TempParentControl = null; }
            }
            if (IsDrag) {
                if (IsOver && (Page_X < phone_x || Page_Y < phone_y - 20 || Page_X > phone_x + phone_width || Page_Y > phone_y + phone_height)) {
                    SplitHr.remove();
                    IsOver = false;
                } else {
                    IsOver = true;
                }
            }
        }, stop: function () {
            if (IsOver && IsDrag) {
                $(SplitHr).after(TempDragControl);
                SplitHr.remove();
                TempDragControl.children(".Div_LineControl,.Div_ControlGroup").removeAttr("id");
                TempDragControl.children(".Div_LineControl,.Div_ControlGroup").attr("index", SysControl_Id);

                var _newcon = new BasicControl(TempDragControl, TempParentControl);
                ToolHandle.List.push(_newcon);
                TempDragControl.children().eq(0).draggable(DefaultDraggable);

                //if (TempParentControl) {
                //    TempParentControl.Controls.push(_newcon);
                //    for (var i = 0; i < TempParentControl.Controls.length; i++) {
                //        TempParentControl.Controls[i].Me.children().eq(0).draggable(DefaultDraggable);
                //    }
                //}

                TempParentControl = null;
                TempDragControl = null;
                IsDrag = false;
                IsOver = false;
            } else {
                //alert("IsOver:" + IsOver + ",IsDrag:" + IsDrag);
            }
            //重新计算出所有第一级控件
            ToolHandle.GetChildrenControls();
        }
    });
    //****************************************************
    //添加新控件 【End】
    //****************************************************

    $(".Text_Singer_Num").keydown(function (e) {
        if (e.keyCode == "38") {
            if (!isNaN($(this).val())) {
                var num = parseInt($(this).val()) + 10;
                $(this).val(num);
                e.preventDefault();
            }
        } else if (e.keyCode == "40") {
            if (!isNaN($(this).val())) {
                var num = parseInt($(this).val()) - 10;
                if (num < 50) return;
                $(this).val(num);
                e.preventDefault();
            }
        }
    });

    $(".Text_MinusNum").click(function () {
        event.preventDefault();
        var _con = $(this).prevAll("input").eq(0);
        if (!!_con && !isNaN(_con.val())) {
            var num = parseInt(_con.val()) - 10;
            _con.val(num);

        }
    });
    $(".Text_AddNum").click(function () {
        event.preventDefault();
        var _con = $(this).prevAll("input").eq(0);
        if (!!_con && !isNaN(_con.val())) {
            var num = parseInt(_con.val()) + 10;
            _con.val(num);

        }
    });
    var _t = null;
    //$("[mytitle]").live("focus", function () {
    //    var tooldiv = $("#Div_ToolTip");
    //    if (ToolHandle.GetNodeTop(this) + tooldiv.innerHeight() >= $(document).height()) {
    //        tooldiv.css({
    //            "top": ToolHandle.GetNodeTop(this) - tooldiv.innerHeight(),
    //            "left": ToolHandle.GetNodeLeft(this)
    //        }).html($(this).attr("mytitle"));
    //        $("#Div_ToolTip").show("fast", function () {
    //            _t = setTimeout(function () { $("#Div_ToolTip").hide("fast"); }, "2000");
    //        });
    //    } else {
    //        tooldiv.css({
    //            "top": ToolHandle.GetNodeTop(this) + tooldiv.innerHeight(),
    //            "left": ToolHandle.GetNodeLeft(this)
    //        }).html($(this).attr("mytitle"));
    //        $("#Div_ToolTip").slideDown("fast", function () {
    //            _t = setTimeout(function () { $("#Div_ToolTip").slideUp("fast"); }, "2000");
    //        });
    //    }
    //});
    //$("[mytitle]").live("blur", function () {
    //    if ($("#Div_ToolTip").is(":visible")) { $("#Div_ToolTip").hide(); clearTimeout(_t); }
    //    else $("#Div_ToolTip").slideUp("fast");
    //});
});