// pages/order-review-list/order-review-list.js

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
        pageTitle: '晒单评价',
    }),
    // 跳转发布评价
    goOrderReviewPost(e) {
		var itemID = e.currentTarget.dataset.itemId;
        wx.navigateTo({
			url: '/pages/order-review-post/order-review-post?id=' + this.options.id + '&itemID=' + itemID
        })
    },
    onLoad(options) {
        this.setData({
            currentPages: getCurrentPages().length
        });

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
        this.onPullDownRefresh();
    },
    onPullDownRefresh() {
        this.onLoad(this.options);
    },
}))