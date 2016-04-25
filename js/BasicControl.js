/// <reference path="jquery-1.8.3-vsdoc.js" />
/// <reference path="ControlProperty.js" />


//创建基础控件（传入当前控件及父控件Id
function BasicControl(c, parentId) {
    if (!c) { throw ("错误，创建的控件不存在。"); }
    this.Id = SysControl_Id++;
    this.ParentId = parentId ? parentId.toString() : "";
    this.Me = $(c);
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
                    this.Property = {
                        IsRequired: false,
                        Title: "单行输入框",
                        Name: "单行输入框",
                        Tooltip: "请输入",
                        Text: "",
                        MaxLength: 100,
                        Height: 50,
                        IsEnable: true
                    };
                    this.ControlType = "Text";
                    this.HasControl = false;
                    this.IsRootControl = false;
                    break;
                case "Control_Textarea":
                    this.ControlType = "Textarea";
                    this.Property = {
                        IsRequired: false,
                        Title: "多行输入框",
                        Name: "多行输入框",
                        Tooltip: "请输入",
                        Text: "",
                        MaxLength: 1000,
                        Height: 50,
                        IsEnable: true
                    };
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
                        Number: "",
                        Height: 50,
                        IsEnable: true
                    };
                    this.HasControl = false;
                    this.IsRootControl = false;
                    break;
                case "Control_Remark":
                    this.ControlType = "Remark";
                    this.Property = {
                        Title: "说明文字",
                        Name: "说明",
                        IsEnable: true
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
                        IsEnable: true,
                        MaxLength: 500,
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
        },
    });
}
//基础控件原型函数
BasicControl.prototype = {
    constructor: BasicControl,//原型字面量方式会将对象的constructor变为Object，此外强制指回Person
    getName: function () {
        return this.CreateDate;
    }
}