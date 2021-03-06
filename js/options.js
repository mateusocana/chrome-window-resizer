$(function(){
			
			var winPosTimer;
			
			displayRows();

			$("#resolutionsList").sortable({ 
												handle	: '.handle', 
												opacity	: '0.6', 
												axis	: 'y',
												stop	: function () { saveSettings(); } 
											});
			
			$('#closeOptions, #finish').click(function(e){
				e.preventDefault();
				closeActiveTab();
			});
			
			$('.i_delete').on( 'click', function(e){
				e.preventDefault();
				
				var delID = $(this).parent().attr('id');
				if ( delID == $('#editID').val() ) {
					$('#resetEdit').click();
				}
				
				$(this).parent().fadeTo( 300, 0, function(){
					$(this).slideUp( 200, function(){
						$(this).remove();
						
						saveSettings();
					});
				});
			});
			
			$('.i_edit').on( 'click', function(e){
				e.preventDefault();
				
				$('#resetEdit').click().css('display', 'block');
				$('#errorMsg').hide(0);
				
				titleEdit();
				
				var old = $(this).parent().data('settings');
				
				$('#newTitle').val(old.title);
				$('#newWidth').val(old.width);
				$('#newHeight').val(old.height);
				$('#newX').val(old.X);
				$('#newY').val(old.Y);
				$('INPUT[name="newType"][value="' + old.type + '"]').attr('checked', true);
				
				if ( old.X || old.Y || old.X === 0 || old.Y === 0 || old.X === '0' || old.Y === '0' ) {
					old.pos = 1;
				}
				$('INPUT[name="usePos"][value="' + old.pos + '"]').attr('checked', true).click();
				
				$('#editID').val($(this).parent().attr('id'));
			});
			
			$('INPUT[name="useSize"]').click(function(){
				var sizeType = $('INPUT:checked[name="useSize"]').val();
				
				if ( sizeType == 3 ) {
					disableSizeFields();
					updateWSize(window.innerWidth, window.innerHeight);
				} else if ( sizeType == 2 ) {
					disableSizeFields();
					updateWSize(window.outerWidth, window.outerHeight);
				} else {
					updateWSize('', '');
					
					$('#newWidth').attr('disabled', false);
					$('#newHeight').attr('disabled', false);
					
					$('#sizeFields').stop().fadeTo(300, 1);
				}
			});
			
			function disableSizeFields() {
				$('#newWidth').attr('disabled', true);
				$('#newHeight').attr('disabled', true);
				
				$('#sizeFields').stop().fadeTo(300, 0.5);
			}
			
			function updateWSize(width, height) {
				$('#newWidth').val(width);
				$('#newHeight').val(height);
			}
			
			function titleAdd() {
				$('#titleEdit').css('display', 'none');
				$('#titleAdd').css('display', 'inline');
			}
			
			function titleEdit() {
				$('#titleEdit').css('display', 'inline');
				$('#titleAdd').css('display', 'none');
			}
			
			$(window).resize(function(){
				var sizeType = $('INPUT:checked[name="useSize"]').val();
				
				if ( sizeType == 2 ) {
					updateWSize(window.outerWidth, window.outerHeight);
				} else if ( sizeType == 3 ) {
					updateWSize(window.innerWidth, window.innerHeight);
				}
			});
			
			
			$('INPUT[name="usePos"]').click(function(){
				var type = $('INPUT[name="usePos"]:checked').val();
				
				if ( type == 1 ) {
					$('#newX, #newY').attr('disabled', false);
				} else {
					$('#newX, #newY').attr('disabled', true).val('');
				}
				
				if ( type == 2 ) {
					winPosTimer = setInterval(function(){
						chrome.windows.getCurrent(function(win){
							$('#newX').val(win.left);
							$('#newY').val(win.top);
						});
					}, 100);
				} else {
					clearInterval(winPosTimer);
				}
			});
			
			$('#resetEdit').click(function(){
				$(this).hide(0);
				$('#errorMsg').hide(0);
				$('#editID').val('');
				titleAdd();
				$('INPUT[name="useSize"][value="1"]').attr('checked', true).click();
				$('INPUT[name="usePos"][value="0"]').attr('checked', true).click();
			});
			
			$('#resetDefault').click(function(){
				if ( confirm( 'Are you sure you want to reset the settings?' ) ) {
					window.localStorage[rowStorage] = '';
					displayRows();
				}
			});
			
			$('#addResForm').submit(function(e){
				e.preventDefault();
				
				var newTitle	= $('#newTitle').val();
				var newWidth	= $('#newWidth').val();
				var newHeight	= $('#newHeight').val();
				var newX		= $('#newX').val();
				var newY		= $('#newY').val();
				var newType		= $('INPUT:checked[name="newType"]').val();
				var editId		= $('#editID').val();
				
				var position    = $('INPUT[name="usePos"]:checked').val();
				position = (position == 2) ? 1 : position;
				
				var errors = [];
				var e = 0;

				/*
				if ( !newTitle ) {
					errors[e] = 'Wrong resolution title!';
					e++;
				}
				*/
				
				if ( newWidth != parseInt(newWidth) ) {
					errors[e] = 'Wrong width value!';
					e++;
				}
				if ( newHeight != parseInt(newHeight) ) {
					errors[e] = 'Wrong height value!';
					e++;
				}
				
				if ( newX != parseInt(newX) && newX != '' ) {
					errors[e] = 'Wrong X value!';
					e++;
				}
				if ( newY != parseInt(newY) && newY != '' ) {
					errors[e] = 'Wrong Y value!';
					e++;
				}
				
				if ( newType != 'desktop' && newType != 'laptop' && newType != 'mobile' ) {
					errors[e] = 'Wrong Media type!';
				}
				
				if ( errors.length ) {
					$('#errorMsg').html( errors.join('<br />') ).fadeIn(150).click(function(){ $(this).fadeOut(150) });
				} else {
					$('#errorMsg').fadeOut(150);
					
					$('INPUT[type="text"]').attr('value', '');
					$('INPUT[type="hidden"]').attr('value', '');
					$('INPUT[type="radio"]').attr('checked', false);
					
					$('#resetEdit').click();

					var newSettings = {
											title	: newTitle,
											width	: newWidth,
											height	: newHeight,
											type	: newType,
											X		: newX,
											Y		: newY,
											pos		: position
										};
					
					if ( editId == '') {
						var nextID = $('#resolutionsList LI:last').attr('id');
						if ( nextID ) {
							nextID = parseInt(nextID.replace('row', ''));
							nextID++;
							nextID = nextID;
						} else {
							nextID = 0;
						}
						newSettings.ID = nextID;
						addRow(newSettings);
					} else {
						$('#' + editId).data('settings', newSettings);
						var html = '<span class="icon i_' + newSettings.type + '" title="Drag to rearrange list"></span>' + 
									'<strong>' + newSettings.width + '&nbsp;x&nbsp;' + newSettings.height + '</strong><span class="resDetail">' + newSettings.title + '</span>';
						$('#' + editId + ' .handle').html(html);
					}
					
					saveSettings();
				}
				
				
			});
			
			$('A[rel~="external"]').click(function(){
				this.target = '_blank';
			});
		});