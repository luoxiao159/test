// pages/web-view/web-view.js

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
        pageTitle: app.data.name,
    }),
    onLoad(options) {
        this.setData({
            src: app.Util.updateQueryParameter(decodeURIComponent(options.src), 'rnd', new Date().getTime()),
            currentPages: getCurrentPages().length
        });
    }
}))