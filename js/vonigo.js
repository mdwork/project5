$(function() {

	$(".zip-postal").on("keydown", function(e) {
		if (e.keyCode == 13)
			submitForm.apply(this, [ e ]);
	});

	$(".zip_form_submit").on("click", function(e) {
		submitForm.apply(this, [ e ]);
	});

});

function submitForm(e) {
	var $form = $(this).parents("form");
	var isValid = chk($form[0]);
	if (isValid){
		if ( typeof _gas != "undefined")
			_gas.push(['_linkByPost', $form[0]]);
		window.open($form.attr("action") + "&" + $form.serialize() + parseGET.get(), "_blank");
		return false;
	};
};

function chk(f) {
	var d = valRep(valRep(valRep(valRep(valTrim(f["zip"].value), " ", ""), "-",
			""), ")", ""), "(", "");
	var p = valRep(valRep(valRep(valRep(valTrim(f["zipPic"].value), " ", ""),
			"-", ""), ")", ""), "(", "");
	var isPVal = true, isDVal = true, isValid = true;
	if (d == f["zip"].defaultValue) {
		isDVal = false;
	} else if (d.length == 3) {
		var oRx = new RegExp(/^([A-Z])\d{1}([A-Z])$/i);
		isDVal = oRx.test(d);
	} else if (d.length == 5) {
		isDVal = /(^\d{5}$)/.test(d);
	} else {
		var oRx = new RegExp(/^([A-Z])\d{1}([A-Z])\d{1}([A-Z])\d{1}$/i);
		isDVal = oRx.test(d);
	}
	;
	if (p == f["zipPic"].defaultValue) {
		isPVal = false;
	} else if (p.length == 3) {
		var oRx = new RegExp(/^([A-Z])\d{1}([A-Z])$/i);
		isPVal = oRx.test(p);
	} else if (p.length == 5) {
		isDVal = /(^\d{5}$)/.test(p);
	} else {
		var oRx = new RegExp(/^([A-Z])\d{1}([A-Z])\d{1}([A-Z])\d{1}$/i);
		isPVal = oRx.test(p);
	}
	;
	if (isPVal == false && isDVal == false) {
		isValid = false;
		alert("Please enter correct \"from\" and \"to\" Postal Code.")
	} else if (isPVal == false) {
		isValid = false;
		alert("Please enter correct \"to\" Postal Code.")
	} else if (isDVal == false) {
		isValid = false;
		alert("Please enter correct \"from\" Postal Code.")
	}
	return isValid;
};

function valTrim(v) {
	var oRegEx = /^(\s*)$/;
	if (oRegEx.test(v)) {
		v = v.replace(oRegEx, "");
		if (v.length == 0) {
			return v;
		}
	}
	oRegEx = /^(\s*)([\W\w]*)(\b\s*$)/;
	if (oRegEx.test(v)) {
		v = v.replace(oRegEx, '$2');
	}
	return v;
};

function valRep(v, vf, vt) {
	try {
		var i = v.indexOf(vf);
		if (i > -1) {
			while (i > -1) {
				v = v.replace(vf, vt);
				i = v.indexOf(vf);
			}
		}
	} catch (e) {
	}
	;
	return v;
}
