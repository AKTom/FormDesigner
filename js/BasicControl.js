/// <reference path="jquery-1.8.3-vsdoc.js" />
/// <reference path="Main.js" />
/// <reference path="ControlProperty.js" />


//基础控件类(id/原控件/父控件)
function BasicControl(canvas, c, parentId) {
    this.Id = canvas.NewId();
    this.Me = $(c);
    this.Me.children(".Div_LineControl,.Div_ControlGroup").removeAttr("id");
    this.Me.children(".Div_LineControl,.Div_ControlGroup").attr("index", this.Id);

    this.Canvas = canvas;
    this.ParentId = parentId ? parentId.toString() : "";

    this.IsEnable = true;
    this.Property = [];
    this.CreateDate = ToolHandle.GetDate("yyyy-MM-dd hh:mm:ss");
    this.CreateUser = "";
    /*函数*/
    this.GetProperty = function () {
        throw "方法未完成";
    }
    this.Focus = function () {
        throw "方法未完成";
    }

    var _tempclass = c.children("[class*='Control_']").attr("class").split(" ");
    for (var i = 0; i < _tempclass.length; i++) {
        if (_tempclass[i].indexOf("Control_") >= 0) {
            switch (_tempclass[i]) {
                case "Control_Text":
                    //属性集合
                    this.Property = {
                        IsRequired: false,
                        Title: "单行输入框",
                        Name: "单行输入框",
                        Tooltip: "请输入",
                        Value: "",
                        MaxLength: 100,
                        Height: 50,
                        IsDisabled: false,
                        IsHide: false
                    };
                    this.ControlType = "Text";
                    this.HasControl = false;
                    this.IsRootControl = false;
                    break;
                case "Control_Textarea":
                    this.Property = {
                        IsRequired: false,
                        Title: "多行输入框",
                        Name: "多行输入框",
                        Tooltip: "请输入",
                        MultiText: "",
                        MaxLength: 1000,
                        Height: 100,
                        IsDisabled: false,
                        IsHide: false
                    };
                    this.ControlType = "Textarea";
                    this.HasControl = false;
                    this.IsRootControl = false;
                    break;
                case "Control_Number":
                    this.ControlType = "Number";
                    this.Property = {
                        IsRequired: false,
                        Title: "数字输入框",
                        Name: "数字输入框",
                        Tooltip: "请输入",
                        Value: "",
                        Height: 50,
                        IsDisabled: false,
                        IsHide: false
                    };
                    this.HasControl = false;
                    this.IsRootControl = false;
                    break;
                case "Control_DateCombobox":
                    this.ControlType = "DateCombobox";
                    this.Property = {
                        IsRequired: false,
                        Title: "日期选择框",
                        Name: "日期选择框",
                        Tooltip: "请选择",
                        Value: new Date().format("yyyy-MM-dd"),
                        Height: 50,
                        IsDisabled: false,
                        IsHide: false
                    };
                    this.HasControl = false;
                    this.IsRootControl = false;
                    break;
                case "Control_Image":
                    this.ControlType = "Image";
                    this.Property = {
                        Name: "图片框",
                        Tooltip: "图片",
                        Url: "",
                        Height: 50,
                        IsHide: false
                    };
                    this.HasControl = false;
                    this.IsRootControl = false;
                    break;
                case "Control_Remark":
                    this.ControlType = "Remark";
                    this.Property = {
                        Title: "说明文字",
                        Name: "说明",
                        IsHide: false,
                        TitleFontSize: 14,
                    };
                    /*可包含其他控件*/
                    this.HasControl = false;
                    this.IsRootControl = false;
                    break;
                case "Control_Detail":
                    this.ControlType = "Detail";
                    this.Property = {
                        Title: "明细框",
                        Name: "明细框",
                        IsDisabled: false,
                        IsHide: false
                    };
                    /*可包含其他控件*/
                    this.HasControl = true;
                    /*根节点控件不允许被包含到其他控件内*/
                    this.IsRootControl = true;
                    break;
                default:
            }
            break;
        }
    }
    this.DefaultProperty = {};
    for (var item in this.Property) {
        this.DefaultProperty[item] = this.Property[item];
    }

    //控制控件属性
    Object.defineProperties(this, {
        //控件属性
        ControlType: {
            configurable: false,
            writable: false
        },
        //是否允许包含子控件
        HasControl: {
            configurable: false,
            writable: false
        },
        //是否为根节点控件（只能为根节点）
        IsRootControl: {
            configurable: false,
            writable: false
        }
    });

    var _Me = this;

    _Me.SetProperty = {};
    for (var item in this.Property) {
        this.SetProperty["_" + item] = function (value, key, input) {
            _Me.Property[key] = ToolHandle.GetValue(value, ControlProperty[key].DataType);
            ControlProperty[key].Function(_Me, _Me.Property[key], input);
        }
    }

    /*事件*/
    this.Me[0].onmousedown = function (e) {
        canvas.CurrentControl = [_Me];
        e.stopPropagation();
    };
}
//基础控件原型函数
BasicControl.prototype = {
    constructor: BasicControl,//原型字面量方式会将对象的constructor变为Object，此外强制指回Person
    getName: function () {
        return this.CreateDate;
    },
    Remove: function () {
        try {
            this.Canvas.RemoveOfId(this.Id);
        } catch (e) {
            console.error(e.message);
        }
    },
    //选择当前控件
    Select: function () {
        var con = this;
        con.Me[0].className += ' Div_SelectControl';
        var pros = [];
        /*展示所有属性*/
        var html = '';

        for (var p in con.Property) {
            var pro = ControlProperty[p];
            var has = false;
            for (var i = 0; i < pros.length; i++) {
                try {
                    if (pros[i].Group.Name == pro.Group.Name) {
                        pros[i].Propertys.push(pro);
                        has = true;
                        break;
                    }
                } catch (e) {
                    debugger;
                }
            }
            if (!has) {
                pros.push({
                    Group: pro.Group,
                    Propertys: [pro]
                });
            }
        }
        for (var i = 0; i < pros.length; i++) {
            html += '<div class="div_LittleTitle"><i class="' + pros[i].Group.Icon + '"></i><label>' + pros[i].Group.Title + '</label></div>';
            for (var o = 0; o < pros[i].Propertys.length; o++) {
                html += '<div class="div_PropertyName">' + pros[i].Propertys[o].Title + "(" + pros[i].Propertys[o].Name + ')' + (pros[i].Propertys[o].IsRequired ? '<i class="Span_RedStar">*</i>' : '') + '</div><div class="div_PropertyValue" unit="px">' + pros[i].Propertys[o].EditMode.Init(pros[i].Propertys[o], con.Property[pros[i].Propertys[o].Name]) + '</div>';
            }
        }
        html += '<input type="button" value="设置为默认" /><input type="button" value="导出Json" onclick="SaveFile()" />';
        document.getElementsByClassName("div_PropertyPanel")[0].innerHTML = ToolHandle.GetTemplate(html, con.Property);

        var keys = Object.keys(con.Property);
        for (var i = 0; i < keys.length; i++) {
            var element = document.getElementById("Div_ControlProperty").querySelector("[name='" + keys[i] + "']");
            if (element) {
                element.addEventListener("input", function (event) {
                    //if (con.Property[event.target.name] == con.DefaultProperty[event.target.name]) {
                    //    event.currentTarget.className += " ControlNewValue";
                    //}
                    //else {
                    //    event.currentTarget.className = event.currentTarget.className.replace(" ControlNewValue", "");
                    //}
                    con.SetProperty["_" + event.target.name](event.target.value, event.target.name, event.target);
                }, false);
            }
        }

        //for (var p in con.Property) {
        //    var _p = p;

        //}
    },
    //取消选择当前控件
    CancelSelect: function () {
        this.Me[0].className = this.Me[0].className.replace(' Div_SelectControl', '');
        document.getElementsByClassName("div_PropertyPanel")[0].innerHTML = "";
    }
}
