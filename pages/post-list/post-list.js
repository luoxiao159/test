// pages/post-list/post-list.js

/**
 * Project: WooCommerce微信小程序
 * Description: 将WooCommerce商城接入微信小程序
 * Author: 
 * Organization: 
 */

const Zan = require('../../vendor/ZanUI/index');
const app = getApp();

Page(Object.assign({}, Zan.Tab, app.Methods, {
    data: Object.assign({}, app.Variables, {
        NAV_HEIGHT: wx.STATUS_BAR_HEIGHT + wx.DEFAULT_HEADER_HEIGHT + 'px',
        NAV_BAR_HEIGHT: wx.DEFAULT_HEADER_HEIGHT + 'px',
        pageTitle: '资讯',
        posts: [],
        tabSelected: 'lastest',
        searchInputValue: ''
    }),
    page: 1,
    options: null,
    // 选项卡变更
    handleZanTabChange({
        componentId,
        selectedId
    }) {
        if (componentId == 'category-tab') {
            this.setData({
                tabSelected: selectedId
            });
            if (selectedId == 'lastest') {
                delete this.params.categories;
            } else {
                this.params.categories = selectedId;
            }
            this.onLoad(this.options);
        }
    },
    // 刷新分类
    refreshCategories() {
        app.Util.network.GET({
            url: app.API('post_category'),
            showLoading: false,
            success: data => {
                this.setData({
                    tabList: data
                });
            }
        });
    },
    // 跳转搜索页
    searchSubmit(e) {
        var search = e.detail.value;
        search = search;
        if (search == '') {
            wx.showToast({
                title: '请输入搜索内容',
                icon: 'none'
            })
        } else {
            this.params.search = search;
            this.onLoad();
        }
    },
    // 清空搜索
    clearSearch() {
        this.setData({
            searchInputValue: '',
			clearSearchShow: false
        });
        if (this.params.search) {
            delete this.params.search;
            this.onLoad();
        }
    },
    // 搜索输入框输入
    searchInput(e) {
        this.setData({
            clearSearchShow: e.detail.value.trim() != '' || this.params.search || false
        })
    },
    loadData() {
        if (this.data.bottomStyle == 'nomore' || this.data.bottomStyle == 'empty') {
            if (this.page != 1) {
                wx.showToast({
                    icon: 'none',
                    title: '没有更多了~'
                })
            }
            return;
        }

        if (this.params == undefined) {
            this.params = {};
        }

        app.Util.network.GET({
            url: app.API('posts'),
            params: Object.assign({}, this.params, {
                page: this.page
            }),
            success: data => {

                if (data.length == 0) {
                    this.setData({
                        bottomStyle: (this.page == 1 ? 'empty' : 'nomore')
                    });
                    if (this.page != 1) {
                        wx.showToast({
                            icon: 'none',
                            title: '没有更多了~'
                        })
                    }
                    return;
                }

                var setdata = {};
                var offset = (this.page - 1) * 10;
                for (var i = 0; i < data.length; i++) {
                    setdata['posts[' + (offset + i) + ']'] = data[i];
                }
                this.setData(setdata);
                this.page++;
            }
        });
    },
    goPostDetail(e) {
        var id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/post-detail/post-detail?id=' + id
        })
    },
    onLoad(options) {
        this.setData({
            posts: [],
            bottomStyle: false
        });
        this.options = options;
        this.page = 1;
        this.loadData();
    },
    onShow() {
        this.refreshCategories();
    },
    onPullDownRefresh() {
        this.onLoad(this.options);
    },
    onReachBottom() {
        //this.refreshCategories();
        this.loadData();
    }
}))