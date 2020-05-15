// pages/product-list/product-list.js

/**
 * Project: WooCommerce微信小程序
 * Description: 将WooCommerce商城接入微信小程序
 * Author: 
 * Organization: 
 */

const Zan = require('../../vendor/ZanUI/index');
const app = getApp();

Page(Object.assign({}, Zan.TopTips, app.Methods, {
    data: Object.assign({}, app.Variables, {
        NAV_HEIGHT: wx.STATUS_BAR_HEIGHT + wx.DEFAULT_HEADER_HEIGHT + 'px',
        NAV_BAR_HEIGHT: wx.DEFAULT_HEADER_HEIGHT + 'px',
        pageTitle: '产品列表',
        currency: app.data.currency,
        products: null,
        bottomStyle: null,
        searchInputValue: '',
        /* W2W Extension, Name: w2w-products-filter-and-orderby, Code: filterData */
        isFilterOrderby: true,
        /* W2W Extension, Name: w2w-products-filter-and-orderby, Code: filterData */
    }),
    per_page: 10,
    page: 1,
    options: null,
    goProductDetail(e) {
        app.goProductDetail(e);
    },
    addToCart(e) {
        this.doAddToCart(e, () => {
            this.setData({
                cart_quantity: app.data.cart_quantity
            });
        });
    },
    goCart() {
        wx.switchTab({
            url: '/pages/cart/cart'
        })
    },
    goTop() {
        wx.pageScrollTo({
            scrollTop: 0
        })
    },
    // 提交搜索
    searchSubmit(e) {
        var search = e.detail.value;
        search = search;
        if (search == '') {
            wx.showToast({
                title: '请输入搜索内容',
                icon: 'none'
            })
        } else {
            this.closeSearch();
            this.options.search = search;
            this.onLoad(this.options);
            this.addKeywordHistory(search);
        }
    },
    // 清空搜索
    clearSearch() {
        this.setData({
            searchInputValue: '',
        });
        if (this.params.search) {
            this.closeSearch();
            delete this.params.search;
            delete this.params.visibility;
            delete this.options.search;
            this.onLoad(this.options);
        }
    },
    // 搜索输入框输入
    searchInput(e) {
        this.setData({
            searchInputValue: e.detail.value
        })
    },
    // 搜索输入框聚焦
    searchInputFocus() {
        if (this.data.history) {
            if (this.data.history.length > 0) {
                this.setData({
                    showSearchHistory: true
                });
            }
        } else {
            wx.getStorage({
                key: 'searchHistory',
                success: res => {
                    this.setData({
                        history: res.data,
                        showSearchHistory: res.data.length > 0
                    });
                },
            })
        }
    },
    // 关闭搜索
    closeSearch() {
        this.setData({
            showSearchHistory: false,
            showCategoryList: false
        });
        this.cancelCategorySelect(false);
    },
    // 点击提交搜索
    goSearch(e) {
        var search = e.currentTarget.dataset.keyword;
        this.closeSearch();
        this.options.search = search;
        this.onLoad(this.options);
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
                    this.closeSearch();
                }
            }
        })
    },
    // 关键词填入输入框
    pushToSeachIuput(e) {
        this.setData({
            searchInputValue: e.currentTarget.dataset.keyword,
            clearSearchShow: true
        });
    },
    // 打开菜单弹窗
    openSearchActionPopup(e) {
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
    // 添加搜索历史
    addKeywordHistory(keyword) {
        var history = this.data.history || [],
            index = history.indexOf(keyword);
        if (index > -1) {
            history.splice(index, 1);
        }
        history.unshift(keyword);
        this.setData({
            history: history
        });
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
    // 打开/关闭分类列表
    toggleCategoryList() {
        this.setData({
            showCategoryList: !this.data.showCategoryList
        });
    },
    // 选择一级分类
    categoryChange(e) {
        var id = e.currentTarget.dataset.id,
            parent = e.currentTarget.dataset.parent;
        var data = {
            currentCategory: id,
            currentParentCategory: parent
        };
        // 取消选中当前分类
        if (this.data.currentCategory == id) {
            data.currentCategory = this.data.currentParentCategory || null;
            data.currentParentCategory = null;
        }
        // 取消选中主分类
        else if (this.data.currentParentCategory == id) {
            data.currentCategory = null;
            data.currentParentCategory = null;
        }
        this.setData(data);
    },
    // 取消选择分类
    cancelCategorySelect(toggle = true) {
        if (this.categoryValue) {
            this.setData(this.categoryValue);
        }
        if (toggle) {
            this.toggleCategoryList();
        }
    },
    // 确定选择分类
    confirmCategorySelect() {
        if (this.data.currentCategory) {
            this.params.category = this.data.currentCategory;
        } else {
            delete this.params.category;
        }
        this.categoryValue = {
            currentCategory: this.data.currentCategory,
            currentParentCategory: this.data.currentParentCategory
        };
        this.toggleCategoryList();
        this.onLoad(this.options);
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

        app.Util.network.GET({
            url: app.API('products'),
            params: Object.assign({}, this.params, {
                page: this.page,
                per_page: this.per_page
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
                var offset = (this.page - 1) * this.per_page;
                for (var i = 0; i < data.length; i++) {
                    setdata['products[' + (offset + i) + ']'] = data[i];
                }
                this.setData(setdata);
                this.page++;
            }
        });
    },
    onLoad(options) {
        this.setData({
            currentPages: getCurrentPages().length
        });

        if (app.data.cart != null) {
            this.setData({
                cart: app.data.cart
            });
        } else {
            app.checkLogin({
                success: () => {
                    app.refreshCart(cart => {
                        this.setData({
                            cart_quantity: app.data.cart_quantity
                        });
                    });
                }
            })
        }

        this.options = options;
        this.page = 1;
        this.setData({
            products: [],
            bottomStyle: null,
            options: this.options
        });

        var title;
        if (this.params == undefined) {
            this.params = {};
        }

        var setData = {};

        /* 处理options搜索 */
        if (this.options.search) {
            this.params.search = decodeURIComponent(this.options.search);
            this.params.visibility = 'search';
            setData.searchInputValue = this.params.search;
        }

        /* 处理options分类 */
        if (!this.categoryValue) {
            this.categoryValue = {
                currentCategory: null,
                currentParentCategory: null,
            };
        }
        if (this.options.category) {
            //title = decodeURIComponent(this.options.name);
            if (!this.data.categories) {
                this.params.category = this.options.category;
                setData.currentCategory = this.options.category;
                this.categoryValue = {
                    currentCategory: this.options.category,
                    currentParentCategory: 0,
                };
            }
        }

        /* 处理options特色产品 */
        if (this.options.featured) {
            if (!this.data.currentFeaturedFilter) {
                this.params.featured = true;
                setData['currentFeaturedFilter.featured'] = true;
                if (!this.filterFeaturedValue) {
                    this.filterFeaturedValue = {};
                }
                this.filterFeaturedValue.featured = true;
            }
        }

        /* 处理options促销产品 */
        if (this.options.on_sale) {
            if (!this.data.currentFeaturedFilter) {
                this.params.on_sale = true;
                setData['currentFeaturedFilter.on_sale'] = true;
                if (!this.filterFeaturedValue) {
                    this.filterFeaturedValue = {};
                }
                this.filterFeaturedValue.on_sale = true;
            }
        }

        /* W2W Extension, Name: w2w-products-favor, Code: favorCase */
        /* 处理options收藏产品 */
        if (this.options.favor) {
            title = '我收藏的产品';
            this.params.w2w_favor = true;
            this.params.w2w_session = app.data.w2w_session;
        }
        /* W2W Extension, Name: w2w-products-favor, Code: favorCase */

        /* W2W Extension, Name: w2w-advanced-coupon, Code: couponCase */
        /* 处理options可用券产品 */
        if (this.options.coupon) {
            title = '可用券产品';
            this.params.w2w_coupon = this.options.coupon;
        }
        /* W2W Extension, Name: w2w-advanced-coupon, Code: couponCase */

        /* W2W Extension, Name: w2w-products-filter-and-orderby, Code: orderbyCase */
        if (this.options.orderby && this.options.order) {
            var setOptionOrderby = true;
            if (!this.data.orderby) {
                this.data.orderby = {};
                this.data.orderby.default = {
                    orderby: this.options.orderby,
                    order: this.options.order
                }
                this.params.orderby = this.options.orderby;
                this.params.order = this.options.order;
            }
        }
        /* W2W Extension, Name: w2w-products-filter-and-orderby, Code: orderbyCase */

        /* W2W Extension, Name: w2w-products-filter-and-orderby, Code: filterCase */
        if (!this.data.currentFilter) {
            for (var k in this.options) {
                var v = this.options[k];
                if (k.indexOf('filter_') > -1) {
                    this.params[k] = v;
                    if (!setData.currentFilter) {
                        setData.currentFilter = {};
                    }

                    var tax = k.replace(/filter_/, ''),
                        values = v.split(',');
                    for (var i in values) {
                        setData['currentFilter.' + tax + '.' + values[i]] = true;
                    }
                    this.filterValue = setData.currentFilter;
                } else if (k == 'min_price') {
                    this.params.min_price = v;
                    if (!setData.priceFilterValue) {
                        setData.priceFilterValue = [];
                    }
                    setData.priceFilterValue[0] = v;
                } else if (k == 'max_price') {
                    this.params.max_price = v;
                    if (!setData.priceFilterValue) {
                        setData.priceFilterValue = [];
                    }
                    setData.priceFilterValue[1] = v;
                }
            }
        }
        /* W2W Extension, Name: w2w-products-filter-and-orderby, Code: filterCase */

        if (title != undefined) {
            this.title = title;
            wx.setNavigationBarTitle({
                title: title,
            })
            this.setPageTitle(title);
        }

        this.loadData();

        this.setData(setData, () => {
            /* W2W Extension, Name: w2w-products-filter-and-orderby, Code: filterRequest */
            if (this.data.filter == undefined) {
                this.requestFilter(!setOptionOrderby);
            }
            /* W2W Extension, Name: w2w-products-filter-and-orderby, Code: filterRequest */
        })

        if (!this.data.categories) {
            app.Util.network.GET({
                url: app.API('category'),
                params: {
                    per_page: 0
                },
                success: data => {
                    var setData = {
                        categories: data
                    };
                    if (this.options.category) {
                        for (var i in data) {
                            var category = data[i];
                            if (this.options.category == category.id && category.parent != 0) {
                                setData.currentParentCategory = category.parent;
                                this.categoryValue.currentParentCategory = category.parent;
                                break;
                            }
                        }
                    }
                    this.setData(setData);
                }
            });
        }
    },
    /* W2W Extension, Name: w2w-products-filter-and-orderby, Code: filterEvents */
    // 获取筛选和排序数据
    requestFilter(setCurrent = true) {
        if (!this.data.popupWidth) {
            wx.createSelectorQuery().select('.filter-popup .zan-popup__container').boundingClientRect(res => {
                this.setData({
                    popupWidth: res.width
                });
            }).exec();
        }
        var params = {};
        if (this.options.category) {
            params.category = this.options.category;
        }
        app.Util.network.GET({
            url: app.API('product_filter_orderby'),
            params: params,
            success: data => {
                if (!setCurrent && this.data.orderby.default != undefined) {
                    data.orderby.default = this.data.orderby.default;
                }
                if (!this.data.currentFilter) {
                    data.currentFilter = {};
                }
                // 还原当前过滤器
                if (this.filterValue) {
                    data.currentFilter = app.Util.cloneObj(this.filterValue);
                } else {
                    data.currentFilter = {};
                }

                if (!this.data.currentFeaturedFilter) {
                    data.currentFeaturedFilter = {};
                }
                // 还原当前特色促销过滤器
                if (this.filterFeaturedValue) {
                    data.currentFeaturedFilter = app.Util.cloneObj(this.filterFeaturedValue);
                } else {
                    data.currentFeaturedFilter = {};
                }

                // 还原当前价格过滤器
                if (data.filter.price) {
                    if (this.data.priceFilterValue) {
                        data.priceFilterValue = this.data.priceFilterValue;
                        if (!this.data.priceFilterValue[0]) {
                            data.priceFilterValue[0] = data.filter.price.min_price
                        }
                        if (!this.data.priceFilterValue[1]) {
                            data.priceFilterValue[1] = data.filter.price.max_price + data.filter.price.step
                        }
                    } else {
                        data.priceFilterValue = [
                            data.filter.price.min_price,
                            data.filter.price.max_price + data.filter.price.step
                        ];
                    }

                    data.thumbDownStyle = {
                        'box-shadow': '0px 0px 0px 5px rgba(61, 177, 176, 0.5)'
                    };
                }
                this.setData(data);
            }
        });
    },
    // 选择特色促销筛选项
    selectFeaturedFilterItem(e) {
        var item = e.currentTarget.dataset.attr,
            currentFeaturedFilter = this.data.currentFeaturedFilter;
        if (!currentFeaturedFilter) {
            currentFeaturedFilter = {};
        }
        currentFeaturedFilter[item] = !currentFeaturedFilter[item];
        this.setData({
            currentFeaturedFilter: currentFeaturedFilter
        });
    },
    // 选择筛选项
    selectFilterItem(e) {
        var dataset = e.currentTarget.dataset,
            tax = dataset.tax,
            attr = dataset.attr,
            currentFilter = this.data.currentFilter;

        if (!currentFilter[tax]) {
            currentFilter[tax] = {};
        }

        if (currentFilter[tax][attr]) {
            delete currentFilter[tax][attr];
        } else {
            currentFilter[tax][attr] = true;
        }

        this.setData({
            currentFilter: currentFilter
        });
    },
    // 价格范围改变
    priceRangeChange(e) {
        var min_price = e.detail.value[0],
            max_price = e.detail.value[1],
            currentPriceFilter = {
                min_price: min_price
            };
        if (max_price < this.data.filter.price.max_price + this.data.filter.price.step) {
            currentPriceFilter.max_price = max_price;
        }

        this.setData({
            currentPriceFilter: currentPriceFilter
        });

    },
    // 确定筛选
    confirmFilter() {
        var currentFilter = this.data.currentFilter;
        this.filterValue = app.Util.cloneObj(currentFilter);

        // 属性
        for (var tax in currentFilter) {
            var attrs = Object.keys(currentFilter[tax]);
            if (attrs.length > 0) {
                this.params['filter_' + tax] = attrs.join(',');
            } else {
                delete this.params['filter_' + tax];
            }
        }

        // 特色促销
        if (this.data.filter.featured_and_onsale) {
            var currentFeaturedFilter = this.data.currentFeaturedFilter;
            this.filterFeaturedValue = app.Util.cloneObj(currentFeaturedFilter);
            for (var i in this.data.filter.featured_and_onsale.items) {
                var item = this.data.filter.featured_and_onsale.items[i];
                if (currentFeaturedFilter[item]) {
                    this.params[item] = true;
                } else {
                    delete this.params[item];
                }
            }
        }

        // 价格
        if (this.data.currentPriceFilter && this.data.priceFilterValue) {
            this.params.min_price = this.data.currentPriceFilter.min_price;
            this.data.priceFilterValue[0] = this.params.min_price;
            if (this.data.currentPriceFilter.max_price != undefined) {
                this.params.max_price = this.data.currentPriceFilter.max_price;
                this.data.priceFilterValue[1] = this.params.max_price;
            } else {
                delete this.params.max_price;
                if (this.data.filter.price != undefined) {
                    this.data.priceFilterValue[1] = this.data.filter.price.max_price + this.data.filter.price.step;
                }
            }
        }

        this.setData(this.data);
        this.closeFilterPopup();
        this.onLoad(this.options);
    },
    // 排序
    changeOrderby(e) {
        var orderby = e.currentTarget.dataset.orderby,
            current = this.data.orderby.default,
            orderby_items = this.data.orderby.items,
            order;

        for (var key in orderby_items) {
            if (key == orderby) {
                var default_order = orderby_items[key].default_order;
                if (orderby == current.orderby) {
                    if (default_order == false || default_order == '') {
                        return;
                    } else {
                        order = current.order == 'desc' ? 'asc' : 'desc';
                        this.params.order = order;
                    }
                } else {

                    if (default_order == false || default_order == '') {
                        order = '';
                        delete this.params.order;
                    } else {
                        order = default_order;
                        this.params.order = order;
                    }
                }
                break;
            }
        }
        this.params.orderby = orderby;
        this.setData({
            ['orderby.default']: {
                orderby: orderby,
                order: order
            }
        });
        this.onLoad(this.options);
    },
    // 重置筛选器
    resetFilter() {
        // 删除属性筛选
        for (var key in this.params) {
            if (key.indexOf('filter_') > -1) {
                delete this.params[key];
            }
        }

        // 删除价格筛选
        if (this.params.min_price != undefined) {
            delete this.params.min_price;
        }
        if (this.params.max_price != undefined) {
            delete this.params.max_price;
        }

        // 删除特色促销筛选
        if (this.data.filter.featured_and_onsale) {
            for (var i in this.data.filter.featured_and_onsale.items) {
                var item = this.data.filter.featured_and_onsale.items[i];
                delete this.params[item];
            }
        }
        this.data.currentFilter = {};
        this.filterValue = {};
        this.data.currentFeaturedFilter = {};
        this.filterFeaturedValue = {};
        this.data.currentPriceFilter = {};
        if (this.data.filter.price != undefined) {
            this.data.priceFilterValue = [
                this.data.filter.price.min_price,
                this.data.filter.price.max_price + this.data.filter.price.step
            ];
        }

        this.setData(this.data);
        this.closeFilterPopup();
        this.onLoad(this.options);
    },
    openFilterPopup() {
        this.setData({
            isFilterPopup: true
        });
    },
    closeFilterPopup() {
        this.setData({
            isFilterPopup: false
        });
    },
    /* W2W Extension, Name: w2w-products-filter-and-orderby, Code: filterEvents */
    /* W2W Extension, Name: w2w-products-favor, Code: favorEvents */
    // 选择/取消选择产品
    switchSelect(e) {
        var index = e.currentTarget.dataset.index,
            oldSelected = this.data.selectedProducts == undefined ? undefined : this.data.selectedProducts[index],
            selected = oldSelected == undefined || oldSelected == false;
        var empty = true,
            selectedProducts = this.data.selectedProducts || [];
        selectedProducts[index] = selected;
        for (var i in selectedProducts) {
            if (selectedProducts[i] !== false) {
                empty = false;
            }
        }
        this.setData({
            selectedProducts: empty ? [] : selectedProducts
        });
    },
    // 进入/退出编辑
    switchEditFavor() {
        var inEdit = this.data.inEdit;
        inEdit = inEdit == undefined || inEdit == false;
        var data = {
            inEdit: inEdit
        };
        if (!inEdit) {
            data.selectedProducts = null
        }
        this.setData(data);
    },
    // 删除收藏
    deleteFavor() {
        var selectedProducts = this.data.selectedProducts,
            selectedProductsIDs = [];
        for (var i in selectedProducts) {
            if (selectedProducts[i] === true) {
                selectedProductsIDs.push(this.data.products[i].id);
            }
        }
        app.Util.network.POST({
            url: app.API('favor'),
            params: {
                in_favor: false,
                id: selectedProductsIDs,
                w2w_session: app.data.w2w_session
            },
            success: data => {
                wx.showToast({
                    title: '已取消收藏',
                    success: () => {
                        setTimeout(() => {
                            this.switchEditFavor();
                            this.onPullDownRefresh();
                        }, 1500);
                    }
                })
            }
        });
    },
    /* W2W Extension, Name: w2w-products-favor, Code: favorEvents */
    onShow() {
        this.setData({
            cart_quantity: app.data.cart_quantity
        });
    },
    onPullDownRefresh() {
        /* W2W Extension, Name: w2w-products-filter-and-orderby, Code: refreshFilter */
        this.requestFilter(false);
        /* W2W Extension, Name: w2w-products-filter-and-orderby, Code: refreshFilter */
        this.onLoad(this.options);
    },
    onReachBottom() {
        this.loadData();
    },
    onShareAppMessage() {
        return app.getShareInfo({
            title: this.title,
            path: '/pages/product-list/product-list',
            params: this.options,
            appReportInviter: true
        });
    }
}))