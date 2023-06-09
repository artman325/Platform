/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

(function (window, Q, $, undefined) {
	
	if (Q.isEmpty(Q.grabMetamaskError)) {

        // see https://github.com/MetaMask/eth-rpc-errors/blob/main/src/error-constants.ts
        // TODO need to handle most of them
        Q.grabMetamaskError = function _Q_grabMetamaskError(err, contracts) {

            if (err.code == '-32603') {
                if (!Q.isEmpty(err.data)) {
                    if (err.data.code == 3) {
                        //'execution reverted'

                        var str = '';
                        contracts.every(function (contract) {
                            console.log(contract);
                            try {
                                var customErrorDescription = contract.interface.getError(ethers.utils.hexDataSlice(err.data.data, 0, 4)); // parsed
                                if (customErrorDescription) {

                                    var decodedStr = ethers.utils.defaultAbiCoder.decode(
                                        customErrorDescription.inputs.map(obj => obj.type),
                                        ethers.utils.hexDataSlice(err.data.data, 4)
                                    );
                                    str = `${customErrorDescription.name}(${(decodedStr.length > 0) ? '"' + decodedStr.join('","') + '"' : ''})`;
                                    return false;
                                }
                                return true;
                            } catch (error) {
                                return true;
                            }

                        });

                        if (Q.isEmpty(str)) {
                            // handle: revert("here string message")
                            return (err.data.message)
                        } else {
                            return (str);
                        }
                    } else {
                        //handle "Internal JSON-RPC error."
                        return (err.data.message);
                    }
                }
            }

            // handle revert and grab custom error
            return (err.message);
        }
    }
/**
 * @module Assets
 */

var Assets = Q.Assets;
var Users = Q.Users;

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
	
	if (Q.isEmpty(tool.loggedInUserXid)) {
		return console.warn("user not found");
	}
	
	// is admin
	var roles = Object.keys(Q.getObject("roles", Users) || {});

	tool.isAdmin = (roles.includes('Users/owners') || roles.includes('Users/admins'));

	if (!tool.isAdmin) {
		return console.warn("owners/admin role require!");
	}
	
	if (Q.isEmpty(state.communityCoinAddress)) {
		return console.warn("communityCoinAddress required!");
	}
	if (Q.isEmpty(state.communityAddress)) {
		return console.warn("communityAddress required!");
	}
	if (Q.isEmpty(state.chainId)) {
		return console.warn("chainId required!");
	}

	tool.refresh();
	
},

{ // default options here
	abiPath: "Assets/templates/R1/CommunityCoin/contract",	// for test predefined in local app.json
	abiPathPoolF: "Assets/templates/R1/CommunityStakingPool/factory",	// for test predefined in local app.json
	chainId: null,
	communityAddress: null,
	communityCoinAddress: null,
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
			//$toolElement.activate();
			
			//tool.checkOwner();
			tool.refreshPoolList();
			
			$('.Assets_web3_coin_admin_produce', tool.element).off(Q.Pointer.click).on(Q.Pointer.fastclick, function(){
				Q.invoke({
					title: tool.text.coin.admin.createPool,
					template: {
						name: 'Assets/web3/coin/admin/create',
						fields: {
//							title: title,
//							content: content,
//							isVideo: !!videoUrl,
//							isAudio: !!audioUrl,
							//text: tool.text
						}
					},
					className: 'Assets_web3_coin_admin_create',
					trigger: tool.element,
					onActivate: function ($element) {
						if (!($element instanceof $)) {
							$element = $(arguments[2]);
						}
						
						$("button[name=testFill]", $element).off(Q.Pointer.click).on(Q.Pointer.click, function (e) {
							$element.find("input[name=tokenErc20]").val("0x00010100597b8c232656D76a319b6FF696Ed3293");
							$element.find("input[name=duration]").val("365");
							$element.find("input[name=bonusTokenFraction]").val("0");
							$element.find("input[name=popularToken]").val("0x0000000000000000000000000000000000000000");
							$element.find("input[name=donations]").val("[]");
							$element.find("input[name=rewardsRateFraction]").val("0");
							$element.find("input[name=numerator]").val("1");
							$element.find("input[name=denominator]").val("1");
						});
						// save by URL
						$("button[name=create]", $element).off(Q.Pointer.click).on(Q.Pointer.click, function (e) {
							var $this = $(this);
							
							var _close = function(){
								var isDialog = $element.find('.Q_dialog_content').length;
								var columns = Q.Tool.from($this.closest(".Q_columns_tool"), "Q/columns");
								var $column = $this.closest('.Q_columns_column');	
								
								if (isDialog) {
									Q.Dialogs.pop();
								} else if (columns) {
									var min = parseInt($column.data('index'));
									columns.close({min: min}, null, {animation: {duration: 0}});
								}
								
							}
							
							e.preventDefault();
							e.stopPropagation();
							
							$element.addClass("Q_working");

							var vals = {};
							vals.tokenErc20 = $element.find("input[name=tokenErc20]").val();
							vals.duration = $element.find("input[name=duration]").val();
							vals.bonusTokenFraction = $element.find("input[name=bonusTokenFraction]").val();
							vals.popularToken = $element.find("input[name=popularToken]").val();
							vals.donations = $element.find("input[name=donations]").val();
							vals.rewardsRateFraction = $element.find("input[name=rewardsRateFraction]").val();
							vals.numerator = $element.find("input[name=numerator]").val();
							vals.denominator = $element.find("input[name=denominator]").val();
							
							// simple check on Q.empty
							for (var i in vals) {
								
								if (Q.isEmpty(vals[i])) {
									$element.find(".form-group").find("label, input, small").removeClass('text-danger');
									$element.find(`input[name=${i}]`).closest('.form-group').find("label, input, small").addClass('text-danger');
									$element.removeClass("Q_working");
									return console.warn(`"${i}" value can not be empty`);
								}
							}
							
							var contract;
							Q.Users.Web3.getContract(
								state.abiPath, 
								{
									contractAddress: state.communityCoinAddress,
									chainId: state.chainId
								}
							).then(function (_contract) {
								contract = _contract;
								// stupid thing
								// we cant by pass in etherjs value like "[]". is not array ,because -  Array.isArray("[]") => false
								// so need to convert to array "[]".split(',')
								vals.donations = "[]" == vals.donations ?[]:vals.donations.split(',');
							
								return contract.produce(
									vals.tokenErc20, //address tokenErc20,
									vals.duration, //uint64 duration,
									vals.bonusTokenFraction, //uint64 bonusTokenFraction,
									vals.popularToken, //address popularToken,
									vals.donations, //IStructs.StructAddrUint256[] memory donations,
									vals.rewardsRateFraction, //uint64 rewardsRateFraction,
									vals.numerator, //uint64 numerator,
									vals.denominator //uint64 denominator
								);
								
							}).then(function (tx) {
								return tx.wait();
							}).then(function (receipt) {
								
								if (receipt.status == 0) {
									throw 'Smth unexpected';
								}
								tool.refreshPoolList();	
								
							}).catch(function (err) {
                            
                                        
								Q.Notices.add({
									content: Q.grabMetamaskError(err, [contract]),
									timeout: 5
								});
								
								
								
							}).finally(function(){
								$element.removeClass("Q_working");
								_close();
							});
							
						});
					}
				});
						
			});

		});
	},
	refreshPoolList: function(){
		var tool = this;
		var state = this.state;
		var $toolElement = $(this.element);
		var $poolListContainer = $toolElement.find('.Assets_web3_coin_admin_poolsContainer');
		$poolListContainer.addClass("Q_working");
		
		var contractPoolF;
		Q.Users.Web3.getContract(
			state.abiPath, 
			{
				contractAddress: state.communityCoinAddress,
				readOnly: true,
				chainId: state.chainId
			}
		).then(function (contract) {
			return contract.instanceManagment();
		}).then(function (stakingPoolFactory) {
			return Q.Users.Web3.getContract(
				state.abiPathPoolF, 
				{
					contractAddress: stakingPoolFactory,
					readOnly: true,
					chainId: state.chainId
				});
		}).then(function (_contractPoolF) {
			contractPoolF = _contractPoolF
			return contractPoolF.instances();
		}).then(function (instanceAddresses) {
			
			if (Q.isEmpty(instanceAddresses)) {
				$toolElement.find('.Assets_web3_coin_admin_poolsList').html('<tr><td>'+tool.text.coin.admin.errmsgs.ThereAreNoPools+'</td></tr>');
				return instanceAddresses;
			} else {
				var p = [];
				
				instanceAddresses.forEach(function(i){
					p.push(contractPoolF.getInstanceInfoByPoolAddress(i));
				});
				
				console.log(instanceAddresses);
				
				return Promise.all(p);
			}

		}).then(function (instanceInfos) {	
			if (Q.isEmpty(instanceInfos)) {
				
			} else {
				var $tbody = $toolElement.find('.Assets_web3_coin_admin_poolsList tbody');
				$tbody.html('');
				instanceInfos.forEach(function(i, index){
					Q.Template.render('Assets/web3/coin/admin/pools/row', {index: index+1, i:i}, function(err, html){
						$tbody.append(html);
					});
					
					//<td>${i.donations}</td>
				});
				
			}
		}).finally(function(){
			$poolListContainer.removeClass("Q_working");
		});
	},
	checkOwner: function() {
		var tool = this;
		var state = this.state;
		var $toolElement = $(this.element);

//		if (!state.contractAddress || !state.chainId) {
//			return;
//		}
		$toolElement.addClass("Q_working");
	
		Q.Users.Web3.getContract(
			state.abiPath, 
			{
				contractAddress: state.communityCoinAddress,
				readOnly: true,
				chainId: state.chainId
			}
		).then(function (contract) {
			return contract.owner();
		}).then(function (account) {
			
			console.log("tool.loggedInUserXid=", tool.loggedInUserXid);
			console.log("account=", account);
			if (account != tool.loggedInUserXid) {
				let objContainer = $(tool.element).find(".Assets_web3_coin_admin_formContainer");
				//objContainer.addClass("Users_web3_notAuthorized");
				objContainer.addClass("Q_disabled");
			}

//                    if (Q.Users.Web3.getSelectedXid().toLowerCase() == account.toLowerCase()) {
//                        objContainer.show();
//                    } else {
//                        objContainer.hide();
//                    }
		}).finally(function(){
			$toolElement.removeClass("Q_working");
		});

		

	},
	Q: {
		beforeRemove: function () {

		}
	}
});

Q.Template.set("Assets/web3/coin/admin",
`

<div>
	<button class="Assets_web3_coin_admin_produce Q_button">{{coin.admin.btns.createPool}}</button>	
	
	<div class="Assets_web3_coin_admin_poolsContainer">
		<h3>List by pools</h3>
		<table class="Assets_web3_coin_admin_poolsList table ">
		<thead>
		<tr>
			<th scope="col">#</th>
			<th scope="col">{{coin.admin.form.labels.tokenErc20}}</th>
			<th scope="col">{{coin.admin.form.labels.duration}}</th>
			<th scope="col">{{coin.admin.form.labels.bonusTokenFraction}}</th>
			<th scope="col">{{coin.admin.form.labels.popularToken}}</th>

			<th scope="col">{{coin.admin.form.labels.rewardsRateFraction}}</th>
			<th scope="col">{{coin.admin.form.labels.numerator}}</th>
			<th scope="col">{{coin.admin.form.labels.denominator}}</th>
		</tr>
		</thead>
		<tbody>
		<tr class="Assets_web3_coin_admin_loading"><td>{{coin.admin.loading}}</td></tr>
		</tbody>
		</table>
	</div>
	
	<button class="Assets_web3_coin_admin_produce Q_button">{{coin.admin.btns.createPool}}</button>	
	
</div>
`,
	{text: ["Assets/content"]}
);

Q.Template.set("Assets/web3/coin/admin/create",
`
	<div class="form Assets_web3_coin_admin_produceContainer">
		<div class="form-group">
			<label>{{coin.admin.form.labels.tokenErc20}}</label>
			<input name="tokenErc20" type="text" class="form-control" placeholder="{{coin.admin.placeholders.address}}">
			<small class="form-text text-muted">{{coin.admin.form.small.tokenErc20}}</small>
		</div>
		<div class="form-group">
			<label>{{coin.admin.form.labels.duration}}</label>
			<input name="duration" type="text" class="form-control" placeholder="{{coin.admin.placeholders.seconds}}">
			<small class="form-text text-muted">{{coin.admin.form.small.duration}}</small>
		</div>
		<div class="form-group">
			<label>{{coin.admin.form.labels.bonusTokenFraction}}</label>
			<input name="bonusTokenFraction" type="text" class="form-control" placeholder="{{coin.admin.placeholders.fraction}}">
			<small class="form-text text-muted">{{coin.admin.form.small.bonusTokenFraction}}</small>
		</div>
		<div class="form-group">
			<label>{{coin.admin.form.labels.popularToken}}</label>
			<input name="popularToken" type="text" class="form-control" placeholder="{{coin.admin.placeholders.address}}">
			<small class="form-text text-muted">{{coin.admin.form.small.popularToken}}</small>
		</div>
		<div class="form-group">
			<label>{{coin.admin.form.labels.donations}}</label>
			<input name="donations" type="text" class="form-control" placeholder="{{coin.admin.placeholders.tuple}}">
			<small class="form-text text-muted">{{coin.admin.form.small.donations}}</small>
		</div>
		<div class="form-group">
			<label>{{coin.admin.form.labels.rewardsRateFraction}}</label>
			<input name="rewardsRateFraction" type="text" class="form-control" placeholder="{{coin.admin.placeholders.fraction}}">
			<small class="form-text text-muted">{{coin.admin.form.small.rewardsRateFraction}}</small>
		</div>
	
		<div class="form-group">
			<label>{{coin.admin.form.labels.numerator}}</label>
			<input name="numerator" type="text" class="form-control" placeholder="{{coin.admin.placeholders.fraction}}">
			<small class="form-text text-muted">{{coin.admin.form.small.numerator}}</small>
		</div>
	
		<div class="form-group">
			<label>{{coin.admin.form.labels.denominator}}</label>
			<input name="denominator" type="text" class="form-control" placeholder="{{coin.admin.placeholders.fraction}}">
			<small class="form-text text-muted">{{coin.admin.form.small.denominator}}</small>
		</div>
	
		<button name="create" class="Assets_web3_coin_admin_produce Q_button">{{coin.admin.btns.createPoolInForm}}</button>	
<button name="testFill" class="Q_button">testfill</button>	
	
	</div>
`,
{text: ["Assets/content"]});

Q.Template.set("Assets/web3/coin/admin/pools",
`
Template: Assets/web3/coin/admin/pools

`,
{text: ["Assets/content"]});

Q.Template.set("Assets/web3/coin/admin/pools/row",
`
<tr>
	<th scope="row">{{index}}</th>
	<td>{{i.tokenErc20}}</td>
	<td>{{i.duration}}</td>
	<td>{{i.bonusTokenFraction}}</td>
	<td>{{i.popularToken}}</td>

	<td>{{i.rewardsRateFraction}}</td>
	<td>{{i.numerator}}</td>
	<td>{{i.denominator}}</td>
</tr>
`,
{text: ["Assets/content"]});

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