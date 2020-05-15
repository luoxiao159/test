// pages/login/login.js

/**
 * Project: WooCommerce微信小程序
 * Description: 将WooCommerce商城接入微信小程序
 * Author: 
 * Organization: 
 */

const app = getApp();

Page(Object.assign({}, app.Methods, {
    data: Object.assign({}, app.Variables, {
        NAV_HEIGHT: wx.STATUS_BAR_HEIGHT + wx.DEFAULT_HEADER_HEIGHT + 'px',
        NAV_BAR_HEIGHT: wx.DEFAULT_HEADER_HEIGHT + 'px',
        pageTitle: '登录',
        logo: app.data.logo,
        name: app.data.name,
    }),
    loginSuccess(data) {
        wx.navigateBack();
        var page = app.beforeLoginPage;
        page.setData({
            userInfo: data.userInfo
        });
        if (typeof(page.loginSuccess) == 'function') {
            page.loginSuccess(data);
        }
        if (typeof(page._loginSuccess) == 'function') {
            page._loginSuccess();
            delete page._loginSuccess;
        }
    },
    backBtnTap() {
        var page = app.beforeLoginPage;
        if (typeof(page._loginSuccess) == 'function') {
            delete page._loginSuccess;
        }

        wx.navigateBack({
            delta: this.options.back2 ? 2 : 1
        });
    },
    onLoad(options) {
        this.setData({
            currentPages: getCurrentPages().length
        });
        this.options = options;
    },
}))