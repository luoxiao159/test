// pages/category/category.js

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
        pageTitle: '分类',
        style: 'mi',
        categories: null,
        tabSelectedID: 0,
        showMainCategory: app.data.showMainCategory
    }),
    goFeatureProducts() {
        wx.navigateTo({
            url: '/pages/product-list/product-list?featured=true'
        })
    },
    goOnSaleProducts() {
        wx.navigateTo({
            url: '/pages/product-list/product-list?on_sale=true'
        })
    },
    goCategoryProducts(e) {
        var id = e.currentTarget.dataset.id,
            name = e.currentTarget.dataset.name;
        wx.navigateTo({
            url: '/pages/product-list/product-list?category=' + id
        })
    },
    // 选项卡切换
    tabChange(e) {
        var selected = e.currentTarget.dataset.id;
        this.setData({
            tabSelected: selected
        });
    },
    onLoad(options) {
        app.Util.network.GET({
            url: app.API('category'),
            success: data => {
                var firstTopCategory = 0;
                for (var i in data) {
                    if (data[i].parent == 0) {
                        firstTopCategory = data[i].id
                        break;
                    }
                }
                this.setData({
                    categories: data,
                    tabSelected: firstTopCategory
                });
            }
        });
    },
    onShow() {

    },
    onPullDownRefresh() {
        this.onLoad();
    },
    onReachBottom() {

    }
}))