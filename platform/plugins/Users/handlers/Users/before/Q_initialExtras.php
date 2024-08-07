<?php

function Users_before_Q_initialExtras()
{
	$app = Q::app();
	Q_Response::setScriptData("Q.plugins.Users.signatures", 
		Q_Config::get('Users', 'signatures', array())
	);
	Q_Response::setScriptData(
		'Q.plugins.Users.authenticate.expires',
		Q_Config::get('Users', 'authenticate', 'expires', null)
	);
	$communityId = Users::currentCommunityId(true);
	$types = array('Users/icon', 'Users/cover', 'Users/labels');
	foreach ($types as $type) {
		Q_Response::setImageSizes($type);
	}
	$requireLogin = Q_Config::get('Users', 'requireLogin', array());
	$rl_array = array();
	foreach ($requireLogin as $rl => $value) {
		$rl_array[Q_Uri::url($rl)] = $value;
	}
	if (!Q_Request::isAjax()) {
		Q_Response::setScriptData('Q.plugins.Users.Label.externalPrefix', Users_Label::$externalPrefix);
		Q_Response::setScriptData('Q.plugins.Users.requireLogin', $rl_array);
		$successUrl = Q_Config::get('Users', 'uris', "$app/successUrl", "$app/home");
		$afterActivate = Q_Config::get('Users', 'uris', "$app/afterActivate", $successUrl);
		$loginOptions = Q_Config::get('Users', 'login', array(
			"identifierType" => 'email,mobile', 
			"userQueryUri" => 'Users/user',
			"using" => "native,web3,facebook",
			"noRegister" => false
		));
		$loginOptions["afterActivate"] = Q_Uri::url($afterActivate);
		$loginOptions["successUrl"] = Q_Uri::url($successUrl);
		Q_Response::setScriptData('Q.plugins.Users.login.serverOptions', $loginOptions);
		$setIdentifierOptions = Q::take($loginOptions, array('identifierType'));
		Q_Response::setScriptData('Q.plugins.Users.setIdentifier.serverOptions', $setIdentifierOptions);
        
        // get current community address
        $ret = Users_ExternalTo::select()->where(array(
            'userId' => $communityId,
            'platform' => 'web3',
            //'appId' => array($appId, $secondAppId)
        ))->fetchDbRows();
        $communityContracts=array();
        foreach($ret as $k => $v) {
            $communityContracts[$v->appId] = $v->xid;
        }
        Q_Response::setScriptData('Q.plugins.Users.web3.communityContracts', $communityContracts);
        //------------
	}
	Q_Response::setScriptData('Q.plugins.Users.communityId', Users::communityId());
	Q_Response::setScriptData('Q.plugins.Users.communityName', Users::communityName());
	Q_Response::setScriptData('Q.plugins.Users.communitySuffix', Users::communitySuffix());
	Q_Response::setScriptData('Q.plugins.Users.currentCommunityId', Users::currentCommunityId(true));
	Q_Response::setImageSizes('Users/icon');
	Q_Response::setImageSizes('Users/cover');
	$platforms = array(Q_Request::platform());
	foreach (Q_Config::get('Users', 'apps', 'export', array()) as $platform) {
		$platforms[] = $platform;
	}
	$platforms = array_unique($platforms);
	$browsers = array(Q_Request::browser());
	foreach (array('apps' => $platforms, 'browserApps' => $browsers) as $k => $arr) {
		$apps = array();
		foreach ($arr as $platform) {
			$appInfos = Q_Config::get('Users', 'apps', $platform, array());
			if (!$appInfos) continue;
			$private = Q_Config::get('Users', 'apps-private', $platform, array());
			foreach ($appInfos as $appName => $appInfo) {
				$apps[$platform][$appName] = $appInfo;
				foreach($appInfo as $key => $value) {
					if (substr($key, -8) == '-private') {
						unset($apps[$platform][$appName][$key]);
					}
				}
				foreach ($private as $p) {
					unset($apps[$platform][$appName][$p]);
				}
			}
		}
		Q_Response::setScriptData("Q.plugins.Users.$k", $apps);
	}

	if (Q::autoloadRequirementsMet('Users_Web3')) {
		Q_Response::setScriptData('Q.plugins.Users.Web3.chains', Users_Web3::getChains());
		Q_Response::setScriptData('Q.plugins.Users.Web3.contracts', Users_Web3::getContracts());
	} else {
		Q_Response::setScriptData('Q.plugins.Users.Web3.chains', array());
		Q_Response::setScriptData('Q.plugins.Users.Web3.contracts', array());
	}

	// add apple signIn js lib
	if (Q_Request::platform() === 'ios') {
		Q_Response::addScript('https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js', 'Users');
	}

	// fetch labels info
	Q_Response::setScriptData("Q.plugins.Users.labels", Users_Label::getLabelsInfo($communityId));
	
	
	Q_Response::setScriptData('Q.Users.web3.contracts', Q_Config::get("Users", "web3", "contracts", "R1",  array()));
	Q_Response::setScriptData("Q.Users.web3.wallets", Q_Config::get("Users", "web3", "wallets", array()));
}
