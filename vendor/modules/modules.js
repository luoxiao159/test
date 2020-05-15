/**
 * Project: template
 * Description: 小程序模块化装修
 * Author: 
 * Organization: 
 * Version: 20200212
 */
var exports = {};

/* W2W Extension, Name: w2w-home-page-modules, Code: indexModules */
exports.Methods = {
    productListSwitchCategory(e) {
        var app = getApp();
        var dataset = e.currentTarget.dataset,
            id = dataset.id,
            moduleIndex = dataset.moduleIndex,
            params = this.data.modules[moduleIndex].params;
        if (id == 'all') {
            delete params.category;
        } else {
            params.category = id;
        }
        app.Util.network.GET({
            url: app.API('products'),
            params: params,
            success: data => {
                this.setData({
                    ['modules[' + moduleIndex + '].data']: data,
                    ['modules[' + moduleIndex + '].selected_category']: id,
                });
            }
        });
    },
    menuListSwitch() {
        this.setData({
            menuListShow: !this.data.menuListShow
        });
    },
    openMenuList() {
        this.setData({
            menuListShow: true
        });
    },
    closeMenuList() {
        this.setData({
            menuListShow: false
        });
    },
    menuItemTap(e) {
        this.linkTap(e);
        this.closeMenuList();
    },
    mapToCenter(e) {
        var dataset = e.currentTarget.dataset,
            id = dataset.id,
            lng = parseFloat(dataset.lng),
            lat = parseFloat(dataset.lat),
            mapCtx = wx.createMapContext(id);
        mapCtx.moveToLocation({
            longitude: lng,
            latitude: lat
        });
    },
    mapNav(e) {
        var dataset = e.currentTarget.dataset,
            lng = parseFloat(dataset.lng),
            lat = parseFloat(dataset.lat),
            label = dataset.label;
        wx.openLocation({
            name: label,
            longitude: lng,
            latitude: lat,
        });
    },
    openModulePopup(e) {
        var app = getApp();
        var dataset = e.currentTarget.dataset,
            id = dataset.id,
            reshow = parseInt(dataset.reshow);
        var showed = false;
        var current = app.Util.getTimestamp();
        var timestamp = reshow < 0 ? false : current + 3600 * 24 * reshow;
        var popupData = {
            [id]: timestamp
        };
        wx.getStorage({
            key: 'popup',
            success: res => {
                var t = res.data[id];
                if (reshow == 0 || (t === false && timestamp !== false) || (t !== false && current >= t) || t === undefined) {
                    this.setData({
                        isModulePopup: true
                    });
                    showed = true;
                }
            },
            fail: () => {
                this.setData({
                    isModulePopup: true
                });
                showed = true;
            },
            complete: () => {
                if (showed) {
                    wx.setStorage({
                        key: 'popup',
                        data: popupData,
                    })
                }
            }
        })
    },
    closeModulePopup(e) {
        this.setData({
            isModulePopup: false
        });
    },
};
exports.Variables = {
    mapMarkerStyle: {
        fontSize: 14,
        color: '#FF0202', //文本颜色
        borderRadius: 14, //边框圆角
        borderWidth: 0.6, //边框宽度
        borderColor: '#FF0202', //边框颜色
        bgColor: '#ffffff', //背景色
        padding: 10, //文本边缘留白
        textAlign: 'center', //文本对齐方式。有效值: left, right, center
        display: 'ALWAYS',
    }
};
/* W2W Extension, Name: w2w-home-page-modules, Code: indexModules */

module.exports = exports;