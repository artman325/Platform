<?php

include('Q.inc.php');

$uri = str_replace('/Q/uploads/Streams', '/Q/internal/Streams', $_SERVER['REQUEST_URI']);

$filename = Q::realPath(Q_Html::themedFilename(Q_Request::tail()));
$can = Q_Utils::canReadFromPath($filename);
if ($can) {
	$mimeType = mime_content_type($filename);
        header("Content-Type: $mimeType");
        header("X-Accel-Redirect: $uri");
        header("Cache-Control: no-cache, s-maxage=0");
} else {
	Q_Text::setLanguageFromRequest();
        throw new Users_Exception_NotAuthorized(compact('filename'));
}
