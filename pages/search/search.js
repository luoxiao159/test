// pages/search/search.js

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
        pageTitle: '搜索',
    }),
    // 添加搜索历史
    addKeywordHistory(keyword) {
        var history = this.data.history || [],
            index = history.indexOf(keyword);
        if (index > -1) {
            history.splice(index, 1);
        }
        history.unshift(keyword);
        /*this.setData({
            history: history
        });*/
        wx.setStorage({
            key: 'searchHistory',
            data: history
        })
    },
    // 删除一条搜索历史
    deleteKeywordHistory(keyword) {
        var history = this.data.history || [],
            index = history.indexOf(keyword);
        if (index > -1) {
            history.splice(index, 1);
            this.setData({
                history: history
            });
            wx.setStorage({
                key: 'searchHistory',
                data: history
            })
        }
    },
    // 删除所有搜索历史
    deleteAllKeywordHistory() {
        this.setData({
            history: []
        });
        wx.removeStorage({
            key: 'searchHistory'
        })
    },
    // 跳转搜索页
    searchSubmit(e) {
        var search = '';
        // 表单提交
        if (typeof e.detail.value == 'object') {
            search = e.detail.value.search;
        }
        // 输入框完成提交
        else {
            search = e.detail.value;
        }
        search = search.trim();
        if (search == '') {
            wx.showToast({
                icon: 'none',
                title: '请输入搜索内容',
            })
        } else {
            wx.navigateTo({
                url: '/pages/product-list/product-list?search=' + encodeURIComponent(search)
            })
            this.clearSearch();
            this.addKeywordHistory(search);
        }
    },
    // 清空搜索
    clearSearch() {
        this.setData({
            searchInputValue: '',
            clearSearchShow: false
        });
    },
    // 搜索输入框输入
    searchInput(e) {
        this.setData({
            clearSearchShow: e.detail.value != ''
        })
    },
    // 跳转搜索页
    goSearch(e) {
        var search = e.currentTarget.dataset.keyword;
        wx.navigateTo({
            url: '/pages/product-list/product-list?search=' + encodeURIComponent(search)
        })
        this.clearSearch();
        this.addKeywordHistory(search);
    },
    // 清空搜索历史
    clearHistory() {
        wx.showModal({
            title: '',
            content: '确认清空搜索历史？',
            cancelColor: '#444',
            confirmColor: this.data.mainColor,
            success: res => {
                if (res.confirm) {
                    this.deleteAllKeywordHistory();
                }
            }
        })
    },
    // 关键词填入输入框
    pushToIuput(e) {
        this.setData({
            searchInputValue: e.currentTarget.dataset.keyword,
            clearSearchShow: true
        });
    },
    // 打开菜单弹窗
    openActionPopup(e) {
        this.actionKeyword = e.currentTarget.dataset.keyword;
        wx.showActionSheet({
            itemList: ['删除该条历史'],
            success: res => {
                if (res.tapIndex == 0) {
                    this.deleteKeywordHistory(this.actionKeyword);
                }
            },
            complete: () => {
                delete this.actionKeyword;
            }
        })
    },
    onLoad(options) {
        this.setData({
            currentPages: getCurrentPages().length
        });
    },
    onShow() {
        wx.getStorage({
            key: 'searchHistory',
            success: res => {
                this.setData({
                    history: res.data
                });
            },
        })
    },
}))