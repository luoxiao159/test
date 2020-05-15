// pages/shipping-detail/shipping-detail.js

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
        pageTitle: '物流详情',
        order: null
    }),
    onLoad(options) {
        this.setData({
            currentPages: getCurrentPages().length
        });

        this.options = options;
        app.Util.network.GET({
            url: app.API('order') + options.id,
            params: {
                w2w_session: app.data.w2w_session
            },
            success: data => {
                this.setData({
                    order: data
                });
            }
        });
    },
    onShow() {

    },
    onPullDownRefresh() {
        this.onLoad(this.options);
    },
    onReachBottom() {

    }
}))