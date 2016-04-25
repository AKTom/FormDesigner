//放置位置类型
var LocationType = {
    None: 0,
    Delete: 1
};
//拖动调整大小的按钮类型
var ChangeSizeBtnType = {
    //未调整
    None: -1,
    //往上拖动调整
    Top: 0,
    //往下拖动调整
    Down: 1,
    //往上拖动调整
    Left: 2,
    //往右拖动调整
    Right: 3,
    //往左上拖动调整
    Top_Left: 4,
    //往右上拖动调整
    Top_Right: 5,
    //往左下拖动调整
    Down_Left: 6,
    //往右下拖动调整
    Down_Right: 7
};
//数据类型
var PropertyDataType = {
    //任意类型
    Object: 0,
    //字符串
    Sting: 1,
    //整型数字
    Int: 2,
    //浮点型数字
    Double: 3,
    //布尔类型
    Boolean: 4,
    //函数类型
    Function: 5,
    //字符串数组类型
    Array: 6
};
//编辑器类型
var EditToolMode = {
    //单行文本框
    TextBox: 1,
    //数字文本框
    NumberBox: 2,
    //日期文本框
    DateBox: 3,
    //日期+时间文本框
    DateTimeBox: 4,
    //多行文本框
    MultiTextBox: 5,
    //下拉选择框
    Combobox: 6,
    //单选钮
    RadioButton: 7,
    //复选框
    Checkbox: 8
};
/*属性组信息*/
var GroupType = {
    //必要项
    Requisite: 1,
    //外观
    Design: 2,
    //功能
    Function: 3,
    //其他
    Else: 4
}

//基本控件类
ControlProperty = {
    /*和控件相关联的所有属性（可调整的所有属性）*/
    ControlType: {
        Text: ["Name", "Text", "MaxLength", "IsEnable", "IsRequired", "Tooltip"],
        Textarea: ["Name", "Text", "MaxLength", "IsEnable", "IsRequired", "Tooltip"],
        Number: ["Name", "Number", "IsEnable", "IsRequired", "Tooltip"],
        Detail: ["Name", "IsEnable"]
    },
    /*属性的详细信息*/
    PropertyType: {
        IsRequired: {
            Title: "是否必填",
            Tooltip: "请选择该项是否必填（必选）",
            DataType: PropertyDataType.Boolean,
            EditMode: EditToolMode.Checkbox,
            Option: {
                Yes: { Text: "是", Value: "1" },
                No: { Text: "否", Value: "0" }
            },
            Group: GroupType.Requisite,
            Html: '<div class="div_PropertyName">高度<i class="Span_RedStar">*</i></div><div class="div_PropertyValue" unit="px"><input name="height" type="number" class="Text_Singer" mytitle="请输入控件高度（必填）" value="" /></div>'
        }, Name: {
            Title: "名称",
            Tooltip: "请输入标题（必填）",
            NotNull: true,
            PrimaryKey: true,
            MaxLength: 100,
            Regex: "",
            DataType: PropertyDataType.Sting,
            EditMode: EditToolMode.TextBox,
            Group: GroupType.Requisite,
            Function: function (control, value) { throw ("尚未设置编辑功能。"); }
        }, Text: {
            Title: "内容",
            Tooltip: "请输入内容",
            DataType: PropertyDataType.Sting,
            EditMode: EditToolMode.TextBox,
            Group: GroupType.Function,
            Function: function (control, value) { $(control).find(".Span_LineControl_title_font").text(value); }
        }, Number: {
            Title: "数字",
            Tooltip: "请输入数字",
            DataType: PropertyDataType.NumberBox,
            EditMode: EditToolMode.NumberBox,
            Group: GroupType.Function,
            Function: function (control, value) { $(control).find(".Span_LineControl_title_font").text(value); }
        }, Tooltip: {
            Title: "输入提示",
            Tooltip: "请输入输入提示",
            DataType: PropertyDataType.Sting,
            Group: GroupType.Function,
            EditMode: EditToolMode.TextBox
        }, MaxLength: {
            Title: "最大长度",
            Tooltip: "请输入最大文字长度",
            DataType: PropertyDataType.Int,
            EditMode: EditToolMode.NumberBox,
            Group: GroupType.Function,
            Function: function (control, value) { throw ("尚未设置编辑功能。"); }
        }, IsEnable: {
            Title: "是否禁用",
            Tooltip: "请决定是否禁用控件",
            DataType: PropertyDataType.Int,
            EditMode: EditToolMode.Checkbox,
            Option: {
                Yes: { Text: "是", Value: "1" },
                No: { Text: "否", Value: "0" }
            },
            Group: GroupType.Requisite,
            Function: function (control, value) { throw ("尚未设置编辑功能。"); }
        }, SqlColumnName: {
            Title: "关联Sql字段",
            Tooltip: "请输入SQL关联表的字段名称",
            DataType: PropertyDataType.Sting,
            EditMode: EditToolMode.TextBox,
            Group: GroupType.Requisite,
            Function: function (control, value) { throw ("尚未设置编辑功能。"); }
        }
    },
    //获取某一控件类型所有的属性
    GetControlProperty: function (contype) {
        var _templist = ToolControl.ControlType[contype].Property;
        var propertylist = [];
        for (var i = 0; i < _templist.length; i++) {
            propertylist.push(ToolControl.PropertyType[_templist[i]]);
        }
        return propertylist;
    }
};