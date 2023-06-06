/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

(function (window, Q, $, undefined) {

/**
 * @module Assets
 */

var Assets = Q.Assets;

/**
 * Show balance of tokens by chain and token
 * @class Assets web3/balance
 * @constructor
 * @param {Object} options Override various options for this tool
 */
Q.Tool.define("Assets/web3/coin/admin", function (options) {
	var tool = this;
	var state = this.state;
	var loggedInUser = Q.Users.loggedInUser;
	if (!loggedInUser) {
		return console.warn("user not logged in");
	}

	tool.loggedInUserXid = Q.Users.Web3.getLoggedInUserXid();

	if (Q.isEmpty(state.userId)) {
		return console.warn("userId not found");
	}

	tool.refresh();
},

{ // default options here
	userId: Q.Users.loggedInUserId(),
	chainId: null,
	tokenAddresses: null,
	//template: "Assets/web3/balance/select",
	onRefresh: new Q.Event()
},

{ // methods go here
	refresh: function () {
		var tool = this;
		var state = tool.state;

		Q.Template.render("Assets/web3/coin/admin", {
			chainId: state.chainId,
			chains: Assets.Web3.chains
		}, function (err, html) {
			Q.replace(tool.element, html);

//			if (state.chainId) {
//				tool.balanceOf();
//			} else {
//				$("select[name=chains]", tool.element).on("change", function () {
//					state.chainId = $(this).val();
//					$("select[name=tokens]", tool.element).addClass("Q_disabled");
//					tool.balanceOf();
//				}).trigger("change");
//			}
		});
	},
	Q: {
		beforeRemove: function () {

		}
	}
});

Q.Template.set("Assets/web3/coin/admin",
`Template: Assets/web3/coin/admin`
);

Q.Template.set("Assets/web3/coin/admin/create",
`Template: Assets/web3/coin/admin/create`
);
Q.Template.set("Assets/web3/coin/admin/pools",
`Template: Assets/web3/coin/admin/pools`
);

//Q.Template.set('Assets/web3/balance',
//`{{#if chainId}}{{else}}<select name="chains">
//	{{#each chains}}
//		<option value="{{this.chainId}}">{{this.name}}</option>
//	{{/each}}
//</select>{{/if}}
//<div class="Assets_web3_balance_select"></div>`);
//
//Q.Template.set('Assets/web3/balance/list',
//`{{#each results}}
//	<div data-amount="{{this.tokenAmount}}" data-name="{{this.tokenName}}" data-address="{{this.tokenAddress}}">{{this.tokenName}} {{this.tokenAmount}}</div>
//{{/each}}`);
//
//Q.Template.set('Assets/web3/balance/select',
//`<select name="tokens" data-count="{{results.length}}">
//	{{#each results}}
//		<option data-amount="{{this.tokenAmount}}" data-name="{{this.tokenName}}" data-address="{{this.tokenAddress}}" data-decimals="{{this.decimals}}">{{this.tokenName}} {{this.tokenAmount}}</option>
//	{{/each}}
//</select>`);
	
	
})(window, Q, jQuery);