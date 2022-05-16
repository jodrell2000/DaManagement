const dataFilePath = `../data/chat.json`;
const outputFile = '../html/chatDoc.html';

const documentationFunctions = () => {

    function rebuildChatDocumentation () {

        let writeData = require( 'fs' );
        writeData.writeFileSync( outputFile, "<html><body><style type=\"text/css\">\n" +
            ".tg  {border-collapse:collapse;border-spacing:0;}\n" +
            ".tg td{border-color:black;border-style:solid;border-width:1px;font-family:Arial, sans-serif;font-size:14px;\n" +
            "  overflow:hidden;padding:10px 5px;word-break:normal;}\n" +
            ".tg th{border-color:black;border-style:solid;border-width:1px;font-family:Arial, sans-serif;font-size:14px;\n" +
            "  font-weight:normal;overflow:hidden;padding:10px 5px;word-break:normal;}\n" +
            ".tg .tg-eidr{background-color:#ffffff;position:-webkit-sticky;position:sticky;text-align:left;top:-1px;vertical-align:top;\n" +
            "  will-change:transform}\n" +
            ".tg .tg-0lax{text-align:left;vertical-align:top}\n" +
            ".tg-sort-header::-moz-selection{background:0 0}\n" +
            ".tg-sort-header::selection{background:0 0}.tg-sort-header{cursor:pointer}\n" +
            ".tg-sort-header:after{content:'';float:right;margin-top:7px;border-width:0 5px 5px;border-style:solid;\n" +
            "  border-color:#404040 transparent;visibility:hidden}\n" +
            ".tg-sort-header:hover:after{visibility:visible}\n" +
            ".tg-sort-asc:after,.tg-sort-asc:hover:after,.tg-sort-desc:after{visibility:visible;opacity:.4}\n" +
            ".tg-sort-desc:after{border-bottom:none;border-width:5px 5px 0}</style>\n" +
            "<table id=\"tg-0zToJ\" class=\"tg\">\n" +
            "<thead>\n" +
            "  <tr>\n" +
            "    <th class=\"tg-eidr\">Command</th>\n" +
            "    <th class=\"tg-eidr\">Messages</th>\n" +
            "    <th class=\"tg-eidr\">Images</th>\n" +
            "  </tr>\n" +
            "</thead>\n" +
            "<tbody>" );

        let readData = require( 'fs' );
        readData.readFile( dataFilePath,
            // callback function that is called when reading file is done
            function ( err, data ) {
                // json data
                let jsonData = data;

                // parse json
                let jsonParsed = JSON.parse( jsonData );

                const theCommands = Object.keys( jsonParsed.chatMessages );

                let theMessages;
                let thePictures;

                theCommands.forEach( ( key, index ) => {
                    theMessages = jsonParsed.chatMessages[ key ].messages;
                    thePictures = jsonParsed.chatMessages[ key ].pictures;
                    // console.log( key );
                    // write the command to the table
                    writeData.writeFileSync( outputFile, "<tr>\n" + "<td class=\"tg-0lax\">" + key + "</td>", { flag: 'a+' } );

                    // write the messages in an unordered list
                    writeData.writeFileSync( outputFile, "<td class=\"tg-0lax\"><ul>", { flag: 'a+' } );
                    theMessages.forEach( ( key, index ) => {
                        // console.log( key );
                        writeData.writeFileSync( outputFile, "<li>" + key, { flag: 'a+' } );
                    } );
                    writeData.writeFileSync( outputFile, "</ul></td>", { flag: 'a+' } );

                    // write the pictures as 100 wide images in an unordered list
                    // console.log( thePictures );
                    writeData.writeFileSync( outputFile, "<td class=\"tg-0lax\">", { flag: 'a+' } );
                    if ( thePictures !== undefined ) {
                        thePictures.forEach( ( key, index ) => {
                            // console.log( key );
                            writeData.writeFileSync( outputFile, "<img src=\"" + key + "\" width=\"100\"><br>", { flag: 'a+' } );
                        } );
                    }
                    writeData.writeFileSync( outputFile, "</td>", { flag: 'a+' } );

                    writeData.writeFileSync( outputFile, "</tr>", { flag: 'a+' } );
                } );

                writeData.writeFileSync( outputFile, "</tbody>\n" +
                    "</table>\n" +
                    "<script charset=\"utf-8\">var TGSort=window.TGSort||function(n){\"use strict\";function r(n){return n?n.length:0}function t(n,t,e,o=0){for(e=r(n);o<e;++o)t(n[o],o)}function e(n){return n.split(\"\").reverse().join(\"\")}function o(n){var e=n[0];return t(n,function(n){for(;!n.startsWith(e);)e=e.substring(0,r(e)-1)}),r(e)}function u(n,r,e=[]){return t(n,function(n){r(n)&&e.push(n)}),e}var a=parseFloat;function i(n,r){return function(t){var e=\"\";return t.replace(n,function(n,t,o){return e=t.replace(r,\"\")+\".\"+(o||\"\").substring(1)}),a(e)}}var s=i(/^(?:\\s*)([+-]?(?:\\d+)(?:,\\d{3})*)(\\.\\d*)?$/g,/,/g),c=i(/^(?:\\s*)([+-]?(?:\\d+)(?:\\.\\d{3})*)(,\\d*)?$/g,/\\./g);function f(n){var t=a(n);return!isNaN(t)&&r(\"\"+t)+1>=r(n)?t:NaN}function d(n){var e=[],o=n;return t([f,s,c],function(u){var a=[],i=[];t(n,function(n,r){r=u(n),a.push(r),r||i.push(n)}),r(i)<r(o)&&(o=i,e=a)}),r(u(o,function(n){return n==o[0]}))==r(o)?e:[]}function v(n){if(\"TABLE\"==n.nodeName){for(var a=function(r){var e,o,u=[],a=[];return function n(r,e){e(r),t(r.childNodes,function(r){n(r,e)})}(n,function(n){\"TR\"==(o=n.nodeName)?(e=[],u.push(e),a.push(n)):\"TD\"!=o&&\"TH\"!=o||e.push(n)}),[u,a]}(),i=a[0],s=a[1],c=r(i),f=c>1&&r(i[0])<r(i[1])?1:0,v=f+1,p=i[f],h=r(p),l=[],g=[],N=[],m=v;m<c;++m){for(var T=0;T<h;++T){r(g)<h&&g.push([]);var C=i[m][T],L=C.textContent||C.innerText||\"\";g[T].push(L.trim())}N.push(m-v)}t(p,function(n,t){l[t]=0;var a=n.classList;a.add(\"tg-sort-header\"),n.addEventListener(\"click\",function(){var n=l[t];!function(){for(var n=0;n<h;++n){var r=p[n].classList;r.remove(\"tg-sort-asc\"),r.remove(\"tg-sort-desc\"),l[n]=0}}(),(n=1==n?-1:+!n)&&a.add(n>0?\"tg-sort-asc\":\"tg-sort-desc\"),l[t]=n;var i,f=g[t],m=function(r,t){return n*f[r].localeCompare(f[t])||n*(r-t)},T=function(n){var t=d(n);if(!r(t)){var u=o(n),a=o(n.map(e));t=d(n.map(function(n){return n.substring(u,r(n)-a)}))}return t}(f);(r(T)||r(T=r(u(i=f.map(Date.parse),isNaN))?[]:i))&&(m=function(r,t){var e=T[r],o=T[t],u=isNaN(e),a=isNaN(o);return u&&a?0:u?-n:a?n:e>o?n:e<o?-n:n*(r-t)});var C,L=N.slice();L.sort(m);for(var E=v;E<c;++E)(C=s[E].parentNode).removeChild(s[E]);for(E=v;E<c;++E)C.appendChild(s[v+L[E-v]])})})}}n.addEventListener(\"DOMContentLoaded\",function(){for(var t=n.getElementsByClassName(\"tg\"),e=0;e<r(t);++e)try{v(t[e])}catch(n){}})}(document)</script></body></html>"
                    , { flag: 'a+' } );

            } );
    }

}

module.exports = documentationFunctions;