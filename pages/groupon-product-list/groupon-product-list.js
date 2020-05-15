// pages/groupon-product-list/groupon-product-list.js

/**
 * Project: WooCommerce微信小程序
 * Description: 将WooCommerce商城接入微信小程序
 * Author: 
 * Organization: 
 */

const app = getApp();

Page(Object.assign({}, app.Methods, {
    data: Object.assign({}, app.Variables, {
        /* W2W Extension, Name: w2w-products-groupon, Code: grouponProductListData */
        NAV_HEIGHT: wx.STATUS_BAR_HEIGHT + wx.DEFAULT_HEADER_HEIGHT + 'px',
        NAV_BAR_HEIGHT: wx.DEFAULT_HEADER_HEIGHT + 'px',
        pageTitle: '拼团',
        currency: app.data.currency,
        showNaviBar: false,
        /* W2W Extension, Name: w2w-products-groupon, Code: grouponProductListData */
    }),
    /* W2W Extension, Name: w2w-products-groupon, Code: grouponProductListEvents */
    // 打开规则弹窗
    openGrouponRulePopup() {
        this.setData({
            isGrouponRulePopup: true
        });
    },
    // 关闭规则弹窗
    closeGrouponRulePopup() {
        this.setData({
            isGrouponRulePopup: false
        });
    },
    goProductDetail(e) {
        app.goProductDetail(e);
    },
    load() {
        app.Util.network.GET({
            url: app.API('groupon_products'),
            success: data => {
                this.setData(data, () => {
                    var query = wx.createSelectorQuery();
                    query.select('.banner-image').boundingClientRect();
                    query.exec(res => {
                        this.bannerHeight = res[0].height;
                    })
                });
            }
        });
    },
    onLoad(options) {
        this.setData({
            currentPages: getCurrentPages().length
        });

        this.options = options;
        this.load();
    },
    onShareAppMessage() {
        return app.getShareInfo({
            title: '好货一起拼，拼着买更便宜',
            path: '/pages/groupon-product-list/groupon-product-list',
            imageUrl: this.data.banner,
            appReportInviter: true
        });
    },
    onPageScroll(res) {
        if (!this.bannerHeight) {
            return;
        }
        if (res.scrollTop >= this.bannerHeight && this.data.showNaviBar != true) {
            this.setData({
                showNaviBar: true
            });
            wx.setNavigationBarColor({
                frontColor: '#000000',
                backgroundColor: '#ffffff'
            })
        } else if (res.scrollTop < this.bannerHeight && this.data.showNaviBar != false) {
            this.setData({
                showNaviBar: false
            });
            wx.setNavigationBarColor({
                frontColor: '#ffffff',
                backgroundColor: '#000000'
            })
        }
    },
    onPullDownRefresh() {
        this.onLoad(this.options);
    },
    /* W2W Extension, Name: w2w-products-groupon, Code: grouponProductListEvents */
}))