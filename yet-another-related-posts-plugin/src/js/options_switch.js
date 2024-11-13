function yarppMakeTheSwitch($, data, url) {
	$.get(url, data, function (resp) {
		if (resp === 'ok') {
			window.location.href = './options-general.php?page=yarpp';
		}
	});
}

jQuery(document).ready(function ($) {
	$('.yarpp_switch_button').on('click', function (e) {
		e.preventDefault();
		var url = ajaxurl,
			data = {
				action: 'yarpp_switch',
				go: $(this).data('go'),
				_ajax_nonce: $('#yarpp_switch-nonce').val(),
			};

		if (data.go === 'basic') {
			$('#wpwrap').after(
				'<div id="yarpp_pro_disable_overlay">' +
					'</div>' +
					'<div id="yarpp_pro_disable_confirm">' +
					'<p>' +
					'Are you sure you would like to deactivate YARPP Pro? ' +
					'Doing so will remove all <strong>YARPP Pro</strong> ' +
					'content from your site, including sidebar widgets.' +
					'</p>' +
					'<br/>' +
					'<a id="yarpp_proceed_deactivation" class="button">Deactivate YARPP Pro</a>' +
					'&nbsp;&nbsp;&nbsp;&nbsp;' +
					'<a id="yarpp_cancel_deactivation" class="button-primary">Cancel Deactivation</a>' +
					'</div>',
			);
			$('#yarpp_proceed_deactivation').on('click', function () {
				yarppMakeTheSwitch($, data, url);
			});

			$('#yarpp_cancel_deactivation').on('click', function () {
				window.location.reload();
			});
		} else {
			yarppMakeTheSwitch($, data, url);
		}
	});

	// Display Mode Save Handler
	$('#yarpp-display-mode-save').on('click', function (e) {
		e.preventDefault();

		var $button = $(this);

		// Clear any existing error messages
		$('.error-message', '#yarpp-display-mode').remove();

		var $spinner = $('<span class="spinner is-active"></span>');
		$button.after($spinner);

		var types = [];
		$('input', '#yarpp-display-mode').each(function () {
			if (this.checked) {
				types.push(this.value);
			}
		});

		var data = {
			action: 'yarpp_pro_set_display_types',
			types: types,
			_wpnonce: $('#yarpp_display_nonce').val(),
		};

		$.post(ajaxurl, data, function (response) {
			setTimeout(function () {
				$spinner.remove();

				if (response.success) {
					// Optional: Show success message
				} else {
					$button.after(
						$(
							'<span class="error-message">Something went wrong saving your settings. Please refresh the page and try again.</span>',
						).css({
							'vertical-align': 'middle',
							'margin-left': '10px',
							color: '#dc3232',
						}),
					);
				}
			}, 1000);
		}).fail(function () {
			$spinner.remove();
			$button.after(
				$(
					'<span class="error-message">Failed to save settings. Please try again.</span>',
				).css({
					'vertical-align': 'middle',
					'margin-left': '10px',
					color: '#dc3232',
				}),
			);
		});
	});
});
