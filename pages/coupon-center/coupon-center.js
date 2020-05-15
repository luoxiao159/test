// pages/coupon-center/coupon-center.js

/**
 * Project: WooCommerce微信小程序
 * Description: 将WooCommerce商城接入微信小程序
 * Author: 
 * Organization: 
 */

const app = getApp();

Page(Object.assign({}, app.Methods, {
    data: Object.assign({}, app.Variables, {
        /* W2W Extension, Name: w2w-advanced-coupon, Code: couponCenterData */
        NAV_HEIGHT: wx.STATUS_BAR_HEIGHT + wx.DEFAULT_HEADER_HEIGHT + 'px',
        NAV_BAR_HEIGHT: wx.DEFAULT_HEADER_HEIGHT + 'px',
        pageTitle: '领券中心',
        currency: app.data.currency,
		coupons: null,
        /* W2W Extension, Name: w2w-advanced-coupon, Code: couponCenterData */
    }),
    /* W2W Extension, Name: w2w-advanced-coupon, Code: couponCenterEvents */
    // 优惠券说明展开折叠
    expandSwitch(e) {
        var code = e.currentTarget.dataset.code,
            oldExpanded = this.data.expandedCoupons == undefined ? undefined : this.data.expandedCoupons[code],
            expanded = oldExpanded == undefined || oldExpanded == false;
        var empty = true,
            expandedCoupons = this.data.expandedCoupons || {};
        expandedCoupons[code] = expanded;
        for (var i in expandedCoupons) {
            if (expandedCoupons[i] !== false) {
                empty = false;
            }
        }
        this.setData({
            expandedCoupons: (empty ? {} : expandedCoupons)
        });
    },
    // 处理请求获取的优惠券
    handleCoupons(coupons) {
        var data = {
            coupons: coupons
        };
        for (var i in coupons) {
            if (app.Util.getStrLength(coupons[i].instruction) > 40) {
                coupons[i].showExpandBtn = true;
            }
        }
        this.setData(data);
    },
    onLoad(options) {
		this.setData({
			currentPages: getCurrentPages().length
		});
        app.Util.network.GET({
            url: app.API('coupon_center'),
            success: data => {
                this.handleCoupons(data);
            }
        });
    },
    onPullDownRefresh() {
        this.onLoad();
    },
    onShareAppMessage() {
        return app.getShareInfo({
            path: '/pages/coupon-center/coupon-center',
            appReportInviter: true
        });
    }
    /* W2W Extension, Name: w2w-advanced-coupon, Code: couponCenterEvents */
}))