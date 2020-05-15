// pages/address-edit/address-edit.js

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
        /* W2W Extension, Name: w2w-advanced-address, Code: addressEditData */
        NAV_HEIGHT: wx.STATUS_BAR_HEIGHT + wx.DEFAULT_HEADER_HEIGHT + 'px',
        NAV_BAR_HEIGHT: wx.DEFAULT_HEADER_HEIGHT + 'px',
        pageTitle: '编辑地址',
        address: null,
        fields: {
            billing_first_name: {
                type: 'text',
                label: '收货人',
                placeholder: '姓名'
            },
            billing_phone: {
                type: 'number',
                label: '手机号码'
            },
            billing_country: {
                type: 'select',
                label: '国家/地区'
            },
            billing_state: {
                type: 'select',
                label: '省份'
            },
            billing_city: {
                type: 'text',
                label: '城市'
            },
            billing_address_1: {
                type: 'text',
                label: '详细地址'
            },
            billing_postcode: {
                type: 'text',
                label: '邮政编码'
            }
        },
        selectedCountryIndex: 0,
        selectedStateIndex: 0
        /* W2W Extension, Name: w2w-advanced-address, Code: addressEditData */
    }),
    /* W2W Extension, Name: w2w-advanced-address, Code: addressEditEvents */
    inputFocus(e) {
        var name = e.currentTarget.dataset.name;
        this.setData({
            focusing: name
        });
    },
    // 打开国家列表弹窗
    openCountryPopup() {
        this.setData({
            isCountryPopup: true
        });
    },
    // 关闭国家列表弹窗
    closeCountryPopup() {
        this.setData({
            isCountryPopup: false,
            countries: this.data.allCountries,
            countrySearchValue: ''
        });
    },
    // 打开省份列表弹窗
    openStatePopup() {
        this.setData({
            isStatePopup: true
        });
    },
    // 关闭省份列表弹窗
    closeStatePopup() {
        this.setData({
            isStatePopup: false,
            states: this.data.allStates,
            stateSearchValue: ''
        });
    },
    // 选择位置
    chooseLocation() {
        wx.chooseLocation({
            success: res => {
                console.log('获取位置成功', res);
                var match, data = {};
                var address = res.address;
                var addressDetail, city, stateIndex;
                var regexCity = /^北京市|天津市|重庆市|上海市|香港特别行政区|澳门特别行政区/,
                    regexState = /.+?(省|自治区)/;
                if ((match = regexCity.exec(address)) !== null) {
                    var city = match[0],
                        addressDetail = address.substr(address.indexOf(match[0]) + match[0].length) + ' ' + res.name;
                    var stateID = app.Util.getStateCode(city),
                        stateIndex = this.findIndexByID(this.data.allStates, stateID);

                    data['fields.billing_city.value'] = city;
                    data['address.billing_city'] = city;
                    data['fields.billing_address_1.value'] = addressDetail;
                    data['address.billing_address_1'] = addressDetail;
                    if (stateIndex != undefined) {
                        data.selectedStateIndex = stateIndex;
                    }
                } else if ((match = regexState.exec(address)) !== null) {
                    var state = match[0],
                        stateID = app.Util.getStateCode(state),
                        stateIndex = this.findIndexByID(this.data.allStates, stateID);
                    if (stateIndex != undefined) {
                        data.selectedStateIndex = stateIndex;
                    }
                    address = address.substr(address.indexOf(match[0]) + match[0].length);

                    regexCity = /.+?(市|自治州|县|区)/;
                    if ((match = regexCity.exec(address)) !== null) {
                        var city = match[0],
                            addressDetail = address.substr(address.indexOf(match[0]) + match[0].length) + ' ' + res.name;
                        data['fields.billing_city.value'] = city;
                        data['address.billing_city'] = city;
                        data['fields.billing_address_1.value'] = addressDetail;
                        data['address.billing_address_1'] = addressDetail;
                    } else {
                        var addressDetail = address + ' ' + res.name;
                        data['fields.billing_address_1.value'] = addressDetail;
                        data['address.billing_address_1'] = addressDetail;
                    }
                } else {
                    if (address != '' && res.name != '') {
                        var addressDetail = address != res.name ? address + ' ' + res.name : address;
                        data['fields.billing_address_1.value'] = addressDetail;
                        data['address.billing_address_1'] = addressDetail;
                    }
                }
                if (Object.keys(data).length > 0) {
                    console.log('解析地址', {
                        state: data.selectedStateIndex == undefined ? '无' : this.data.allStates[data.selectedStateIndex].label + ' (' + this.data.allStates[data.selectedStateIndex].id + ')',
                        city: data['fields.billing_city.value'] == undefined ? '无' : data['fields.billing_city.value'],
                        address: data['fields.billing_address_1.value'] == undefined ? '无' : data['fields.billing_address_1.value']
                    });
                    this.setData(data);
                }
            }
        })
    },
    // 搜索数组
    filterArray(array, search) {
        return array.filter(item => {
            return item.label.toLocaleLowerCase().indexOf(search.toLocaleLowerCase()) > -1;
        });
    },
    // 搜索国家
    filterCountry(e) {
        var value = e.detail.value,
            countries = value.trim() == '' ? this.data.allCountries : this.filterArray(this.data.allCountries, value);
        this.setData({
            countries: countries
        })
    },
    // 国家选择
    countryChange(e) {
        var countryID = e.currentTarget.dataset.id,
            countryIndex = this.findIndexByID(this.data.allCountries, countryID);
        this.setData({
            selectedCountryIndex: countryIndex
        });
        this.getStates(this.data.allCountries[countryIndex].id);
        this.closeCountryPopup();
    },
    // 获取指定国家省份
    getStates(country, callback = function() {}) {
        app.Util.network.GET({
            url: app.API('states'),
            params: {
                country: country
            },
            success: data => {
                this.setData({
                    states: data,
                    allStates: data,
                    selectedStateIndex: 0
                });
                callback(data);
            }
        });
    },
    // 搜索省份
    filterState(e) {
        var value = e.detail.value,
            states = value.trim() == '' ? this.data.allStates : this.filterArray(this.data.allStates, value);
        this.setData({
            states: states
        })
    },
    // 省份选择
    stateChange(e) {
        var stateID = e.currentTarget.dataset.id,
            stateIndex = this.findIndexByID(this.data.allStates, stateID);
        this.setData({
            selectedStateIndex: stateIndex
        });
        this.closeStatePopup();
    },
    // 保存地址
    saveAddress(e) {
        var address = e.detail.value;
        if (this.data.allCountries[this.data.selectedCountryIndex] != undefined) {
            address.billing_country = this.data.allCountries[this.data.selectedCountryIndex].id;
        }
        if (address.billing_state == undefined && this.data.allCountries[this.data.selectedCountryIndex] != undefined) {
            address.billing_state = this.data.allStates[this.data.selectedStateIndex].id;
        }
        var postAddress = app.Util.addressTransform(address, 'post');
        var params = postAddress;
        params.w2w_session = app.data.w2w_session;
        if (this.data.mode == 'edit') {
            params.id = this.data.id;
        }
        app.Util.network.POST({
            url: app.API('address'),
            params: params,
            success: data => {
                if (data.success == true) {
                    wx.showToast({
                        title: '已保存',
                        duration: 1000
                    })
                    setTimeout(() => {
                        wx.navigateBack()
                    }, 1000)
                } else {
                    this.showZanTopTips(data.errors);
                }
            }
        });
    },
    findIndexByID(arr, id) {
        for (var i in arr) {
            if (arr[i].id == id) {
                return parseInt(i);
            }
        }
        return undefined;
    },
    onLoad: function(options) {
        this.setData({
            currentPages: getCurrentPages().length
        });
        app.Util.network.GET({
            url: app.API('address'),
            params: {
                w2w_session: app.data.w2w_session
            },
            success: data => {

                var params = {},
                    id = options.id || null,
                    addressList = data.addresses;
                addressList = addressList || [];

                if (id != null) {
                    var ognAddress = addressList[id],
                        address = app.Util.addressTransform(ognAddress);
                    params.country = address.billing_country;
                }

                app.Util.network.GET({
                    url: app.API('countries'),
                    params: params,
                    success: countriesData => {
                        var d = {
                            addressList: addressList,
                            mode: options.mode || 'add',
                            id: options.id || null,
                            allCountries: countriesData.countries,
                            allStates: countriesData.states
                        };
                        if (id != null) {
                            d.address = address;
                            d.selectedCountryIndex = this.findIndexByID(countriesData.countries, address.billing_country) || 0;
                            d.selectedStateIndex = this.findIndexByID(countriesData.states, address.billing_state) || 0;
                        }
                        this.setData(Object.assign({}, countriesData, d));
                    }
                });
            }
        });
    },
    /* W2W Extension, Name: w2w-advanced-address, Code: addressEditEvents */
}))