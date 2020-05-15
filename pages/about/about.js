// pages/about/about.js

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
        pageTitle: '关于 ' + app.data.name,
        padding: 20
    }),
    onLoad(options) {
        this.setData({
            currentPages: getCurrentPages().length
        });
    },
    onShow() {
        app.Util.network.GET({
            url: app.API('about'),
            success: data => {
                this.setData({
                    custom: data.length > 0,
                    content: data,
                    version: app.data.version
                });
            }
        });
    },
    onPullDownRefresh() {
        this.onShow();
    },
    onReachBottom() {

    },
    onShareAppMessage() {
        return app.getShareInfo({
            path: '/pages/about/about',
            appReportInviter: true
        });
    }
}))