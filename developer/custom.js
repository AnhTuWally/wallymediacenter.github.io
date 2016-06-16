var Display;
var MultipleNavsRan = false;
// Navigation Array
var Navigation = [];

$(document).ready(function () {
	var featuredCarousel = $('#featured-carousel.carousel');
	
	if (featuredCarousel.length) {
		featuredCarousel.carousel({
			interval: 7000
//			interval: 10000
		});
	}
	
	// Homepage only (get YouTube playlist and output to document)
	if ($('#youtubePlaylist').length) {
		/**	Replace playlist ID with your playlist in YouTube
		 * 	Example: http://www.youtube.com/watch?v=t5UixdGeEr3&list=drtUYtteFg344-Dfghdfr57gtD
		 *	Playlist ID is after "&list=" so in this case it's  drtUYtteFg344-Dfghdfr57gtD
		 */
		var playlistID = 'PLWYJn6ctkE0CNUd_2AKuXM3wE4vOrvE4x';
		var API = 'AIzaSyCtZnzdawbJ59lI_2Q7c8Von6dKRsvXAC8';

		//var jqxhr = $.ajax( "http://gdata.youtube.com/feeds/api/playlists/"+playlistID+"?v=2&alt=json&max-results=3" )
		var jqxhr = $.ajax( "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=3&playlistId="+playlistID+"&key="+API )
			.done(function(data) {
		    	// Load playlist into site
		    	LoadPlaylist(data);
		  	})
		  	.fail(function() {
		    	console.log('Failed to get playlist ' + playlistID);
		  	});
		  	
		// If selected a video from list update embedded video
		$('#youtubePlaylist').on('click', '.embedVideoItem', function(e) {
			// do not follow link
			e.preventDefault();
			
			// change embedded video
			ChangeEmbeddedVideo($(this).attr('data-embed'), $(this).attr('data-title'));
		});
	}
	
	/* EXPAND: Required for expanding menu */
	$('.expandButton').click(function() {
	   // find the element with the text for the current slide
	   var elem = $(this).parents('.carousel-caption').find('.expandText');

	   if (elem.is(':visible')) {
	       $(this).find('.expandInfoText').text('Read More');
	       $(this).find('.chevron').removeClass('chevron-down').addClass('chevron-up');
	   } else {
	       $(this).find('.expandInfoText').text('Close');
	       $(this).find('.chevron').removeClass('chevron-up').addClass('chevron-down');
	   }
	   // show (or hide) the found text
	   elem.slideToggle();
	});
	
	// set the display size variable
	SetDisplay();
	
	// build the nav obj
	BuildNavigationObj();
	
	HandleMultipleNavigations();
	
	// Copy social menu from horizontal to vertical
	$('#socialListHorizontal').html($('#socialListVertical').html());
	
	// handle the active triangle position
	HandleActiveTriangle($('#featured-tabs li.active'));
	$('#featured-tabs .nav-tabs li').click(function() {
		HandleActiveTriangle($(this));
	});
	
	$(window).resize(function() {
		SetDisplay();
		HandleMultipleNavigations();
		HandleActiveTriangle($('#featured-tabs li.active'));
		HandleContentHeight();
	});
	
	// clicking body overlay closes mobile nav menu
	$('#bodyOverlay').click(function() {
		$('.btnMobileNav').trigger('click');
	});
	
	// copy featured callout to mobile view
	$('#resourcesCopy').html($('#resourcesContainer').html());
	
	// content height
	HandleContentHeight();
});

// Load YouTube playlist JSON into the document
function LoadPlaylist(playlist) {
	var videoURL= 'http://www.youtube.com/watch?v=';
	var firstEntry = {};
	
	// If data is malformed stop parsing
	//if ( (typeof(playlist) === 'undefined' || playlist == '') || (typeof(playlist.feed) === 'undefined' || playlist.feed == '') || (typeof(playlist.feed.entry) === 'undefined' || playlist.feed.entry == '') ) {
	if ( (typeof(playlist) === 'undefined' || playlist == '') || (typeof(playlist.items) === 'undefined' || playlist.items == '') || (typeof(playlist.items[1].snippet) === 'undefined' || playlist.items[1].snippet == '') ) {
		console.log('Invalid JSON data for playlist');
		return false;
	}
	
	var firstRun = true;
	// Loop through each entry //	for (var i in playlist.feed.entry) {
	for (var i in playlist.items) {
		//var item = playlist.feed.entry[i];
		var item = playlist.items[i];
		
		console.log(item);
		
		var entry = {};
		entry.title = item.snippet.title;
		entry.videoID = item.snippet.resourceId.videoId;
		entry.url = videoURL + entry.videoID;
		entry.embedUrl = "http://www.youtube.com/embed/" + entry.videoID;
		entry.thumb = "https://i.ytimg.com/vi/" + entry.videoID + "/default.jpg";

//		entry.title = item.title.$t;
//		entry.feedUrl = item.link[1].href;
//		entry.fragments = entry.feedUrl.split("/");
//		entry.videoID = entry.fragments[entry.fragments.length - 2];
//		entry.url = videoURL + entry.videoID;
//		entry.embedUrl = "http://www.youtube.com/embed/" + entry.videoID;
//		entry.thumb = "http://img.youtube.com/vi/" + entry.videoID + "/default.jpg";
		
		// Save first entry for later use
		if (firstRun) {
			firstEntry = entry;
			firstRun = false;
		}
		
		// Append video template to HTML
		var html = '<div class="media video-item">' +
			'<a class="embedVideoItem pull-left" href="#" data-embed="'+entry.embedUrl+'" data-title="'+entry.title+'"><img class="media-object" src="'+entry.thumb+'" /></a>' +
			'<div class="media-body">' +
				'<h4 class="media-heading">'+entry.title+'</h4>' +
			'</div>' +
		'</div>';
		
		$(html).appendTo('#videoList');
	}
	
	// Change embedded video to first video in playlist
	ChangeEmbeddedVideo(firstEntry.embedUrl, firstEntry.title);
	
	// Update the More Videos button
	//$('#moreVideosLink', $('#youtubePlaylist')).attr('href', playlist.feed.link[0].href);
	
	
}

// Change embedded video
function ChangeEmbeddedVideo(embedUrl, title) {
	$('#embedVideo', $('#youtubePlaylist')).attr('src', embedUrl);
	$('#featuredVideoTitle', $('#youtubePlaylist')).text(title);
}

// handle the white content column height
function HandleContentHeight() {
	// only adjust height if not xs device
	if (!$('#visibleXS').is(':visible')) {
		// if carousel
		if ($('#featured-carousel').length && $('#featured-carousel').is(':visible')) {
			$('#main-content').css('min-height', ($('#sidebarRightCol').height() + 50 - $('#featured-carousel').height()) + 'px');
		} else {
			$('#main-content').css('min-height', ($('#sidebarRightCol').height() + 50) + 'px');
		}
	} else {
		$('#main-content').css('min-height', 0);
	}
}

// handle the triangle position on active tabs
function HandleActiveTriangle(elem) {
	// make sure triangle exists if at all
	if ($('#activeTriangle').length) {
		// if an element is sent
		$('#activeTriangle').css('left', (elem.position().left + (elem.width() / 2) - 12));
	}
}

// build the navigation object
function BuildNavigationObj() {
	// quick links
	var navQuickLinksObj = {
		Title: 'Quick Links',
		RedirectURL: '#',
		Items: []	
	};
	
	// each quick link
	$('#quick-links-dropdown > ul.dropdown-menu > div > div > li > a').each(function() {
		navQuickLinksObj.Items.push({
			Title: $.trim($($(this)).text()),
			RedirectURL: $.trim($( $(this)).attr('href'))
		});
	});
	
	Navigation.push(navQuickLinksObj);
	
	// Each root level nav item
	$('#mainNav > .row > li').each(function() {
		var navObj = {};
		
		// is it active?
		navObj.Active = false;
		if ($(this).hasClass('active')) {
			navObj.Active = true;
		}
		
		// set nav title/url
		navObj.Title = $.trim($('.listItem', $(this)).text());
		navObj.RedirectURL = $.trim($('.listItem a', $(this)).attr('href'));
		
		// is there a dropdown menu?
		if ($('.dropdown-menu', $(this)).length) {
			// initialize the array
			navObj.Items = [];
			// loop each subitem
			$('ul.dropdown-menu > .row > div > li', $(this)).each(function() {
				var subNavObj = {};
				
				// is it active?
				subNavObj.Active = false;
				if ($(this).hasClass('active')) {
					subNavObj.Active = true;
				}
				
				subNavObj.Title = $.trim($('a:first', $(this)).text());
				subNavObj.RedirectURL = $.trim($('a:first', $(this)).attr('href'));
				
				// is there a third level?
				if ($('.subMenu.level3', $(this)).length) {
					// initialize the array
					subNavObj.Items = [];
					// loop each sub subitem
					$('.subMenu.level3 > li', $(this)).each(function() {
						var subSubNavObj = {};

						// is it active?
						subSubNavObj.Active = false;
						if ($(this).hasClass('active')) {
							subSubNavObj.Active = true;
						}
						
						subSubNavObj.Title = $.trim($('a:first', $(this)).text());
						subSubNavObj.RedirectURL = $.trim($('a:first', $(this)).attr('href'));
						
						// 4th level
						if ($('.subMenu.level4', $(this)).length) {
							// initialize the array
							subSubNavObj.Items = [];
							// loop each sub subitem
							$('.subMenu.level4 > li', $(this)).each(function() {
								var subSubSubNavObj = {};
								
								// is it active?
								subSubSubNavObj.Active = false;
								if ($(this).hasClass('active')) {
									subSubSubNavObj.Active = true;
								}
								
								subSubSubNavObj.Title = $.trim($('a', $(this)).text());
								subSubSubNavObj.RedirectURL = $.trim($('a', $(this)).attr('href'));
								
								// add sub sub menu to sub nav object
								subSubNavObj.Items.push(subSubSubNavObj);
							});

						}
						
						// add sub sub menu to sub nav object
						subNavObj.Items.push(subSubNavObj);
					});
				}
				// add to navigation object array
				navObj.Items.push(subNavObj);
			});
		}
		
		// add to global nav array
		Navigation.push(navObj);
		
	});
	
	//console.log(Navigation);
}

// Copy navigations into multiple elements if necessary
function HandleMultipleNavigations() {
	
	if (MultipleNavsRan === true) {
		return false;
	}
	
	// only run once
	MultipleNavsRan = true;
	
	// used to determine which iteration the loop is on
	var i = 0;	
	
	// build mobile navigation HTML
	$('#mobileNavigation').wrapInner('<ul class="mobileNavMenu"></ul>');
	
	for (var item in Navigation) {
		// create root level list
		var listItem = $('#newListItemTemplate').clone();
		// remove ID
		listItem.removeAttr('id').removeAttr('class');
		// add link
		listItem.wrapInner('<a href=""></a>');
		// is it active?
		if (Navigation[item].Active) {
			listItem.addClass('active');
		}
		// set title
		$('a', $(listItem)).text(Navigation[item].Title);
		// set link
		$('a', $(listItem)).attr('href', Navigation[item].RedirectURL);
		
		// are there subitems? (second level)
		if (typeof(Navigation[item].Items) !== 'undefined') {
			// add class to show there are subitems
			$('a', $(listItem)).addClass('hasItems');
			// add subitem list
			$('<ul class="subItemMenu"></ul>').appendTo(listItem);
			// loop each subitem (second level)
			for (var subItem in Navigation[item].Items) {
				// create sub level list
				var subListItem = $('#newListItemTemplate').clone();
				// remove ID
				subListItem.removeAttr('id').removeAttr('class');
				// add link
				subListItem.wrapInner('<a href=""></a>');
				// is it active?
				if (Navigation[item].Items[subItem].Active) {
					subListItem.addClass('active');
				}
				// set title
				$('a', $(subListItem)).text(Navigation[item].Items[subItem].Title);
				// set link
				$('a', $(subListItem)).attr('href', Navigation[item].Items[subItem].RedirectURL);
				
				
				// Is the parent element active?
				if (Navigation[item].Active) {
					// Add second level items to the sidebar
					var subSideListItem = $('#newListItemTemplate').clone();
					// remove ID
					subSideListItem.removeAttr('id').removeAttr('class');
					
					// add link
					subSideListItem.wrapInner('<a href=""></a>');
					// is it active?
					if (Navigation[item].Items[subItem].Active) {
						subSideListItem.addClass('active');
					}
					// set title
					$('a', $(subSideListItem)).text(Navigation[item].Items[subItem].Title);
					// set link
					$('a', $(subSideListItem)).attr('href', Navigation[item].Items[subItem].RedirectURL);
					
					// add sub side item to root level list
					subSideListItem.appendTo($('ul#mainSideNavigation'));
				}
				
				// are there sub subitems? (third level)
				if (typeof(Navigation[item].Items[subItem].Items) !== 'undefined') {
					// add class to show there are subitems
					$('a', $(subListItem)).addClass('hasItems');
					// add sub subitem list
					$('<ul class="subSubItemMenu"></ul>').appendTo(subListItem);
					// loop each sub subitem (third level)
					for (var subSubItem in Navigation[item].Items[subItem].Items) {
						// create sub level list
						var subSubListItem = $('#newListItemTemplate').clone();
						// remove ID
						subSubListItem.removeAttr('id').removeAttr('class');
						// add link
						subSubListItem.wrapInner('<a href=""></a>');
						// is it active?
						if (Navigation[item].Items[subItem].Items[subSubItem].Active) {
							subSubListItem.addClass('active');
						}
						// set title
						$('a', $(subSubListItem)).text(Navigation[item].Items[subItem].Items[subSubItem].Title);
						// set link
						$('a', $(subSubListItem)).attr('href', Navigation[item].Items[subItem].Items[subSubItem].RedirectURL);
						
						// Is the parent element active?
						if (Navigation[item].Items[subItem].Active) {
							// Add third level items to the sidebar
							var subSubSideListItem = $('#newListItemTemplate').clone();
							// remove ID
							subSubSideListItem.removeAttr('id').removeAttr('class');
							
							// add link
							subSubSideListItem.wrapInner('<a href=""></a>');
							// is it active?
							if (Navigation[item].Items[subItem].Items[subSubItem].Active) {
								subSubSideListItem.addClass('active');
							}
							// set title
							$('a', $(subSubSideListItem)).text(Navigation[item].Items[subItem].Items[subSubItem].Title);
							// set link
							$('a', $(subSubSideListItem)).attr('href', Navigation[item].Items[subItem].Items[subSubItem].RedirectURL);
							
							// is there already a nested ul? Add one if not
							if (!$('.nestedMenu', $(subSideListItem)).length) {
								$('<ul class="nestedMenu"></ul>').appendTo($(subSideListItem));
							}
							
							// add sub side item to root level list
							subSubSideListItem.appendTo($('.nestedMenu', $(subSideListItem)));
						}
						
						// are there sub subitems? (fourth level)
						if (typeof(Navigation[item].Items[subItem].Items[subSubItem].Items) !== 'undefined') {
							// add class to show there are subitems
							$('a', $(subSubListItem)).addClass('hasItems');
							// add sub subitem list
							$('<ul class="subSubSubItemMenu"></ul>').appendTo(subSubListItem);
							// loop each sub subitem (third level)
							for (var subSubSubItem in Navigation[item].Items[subItem].Items[subSubItem].Items) {
								// create sub level list
								var subSubSubListItem = $('#newListItemTemplate').clone();
								// remove ID
								subSubSubListItem.removeAttr('id').removeAttr('class');
								// add link
								subSubSubListItem.wrapInner('<a href=""></a>');
								// is it active?
								if (Navigation[item].Items[subItem].Items[subSubItem].Active) {
									subSubSubListItem.addClass('active');
								}
								// set title
								$('a', $(subSubSubListItem)).text(Navigation[item].Items[subItem].Items[subSubItem].Title);
								// set link
								$('a', $(subSubSubListItem)).attr('href', Navigation[item].Items[subItem].Items[subSubItem].RedirectURL);
								
								
								// Add third level items to the sidebar
								var subSubSubSideListItem = $('#newListItemTemplate').clone();
								// remove ID
								subSubSubSideListItem.removeAttr('id').removeAttr('class');
								
								// add link
								subSubSubSideListItem.wrapInner('<a href=""></a>');
								// is it active?
								if (Navigation[item].Items[subItem].Items[subSubItem].Items[subSubSubItem].Active) {
									subSubSubSideListItem.addClass('active');
								}
								// set title
								$('a', $(subSubSubSideListItem)).text(Navigation[item].Items[subItem].Items[subSubItem].Items[subSubSubItem].Title);
								// set link
								$('a', $(subSubSubSideListItem)).attr('href', Navigation[item].Items[subItem].Items[subSubItem].Items[subSubSubItem].RedirectURL);
								
								// is there already a nested ul? Add one if not
								if (!$('.nestedMenu', $(subSubSideListItem)).length) {
									$('<ul class="nestedMenu"></ul>').appendTo($(subSubSideListItem));
								}
								
								// add sub side item to root level list
								subSubSubSideListItem.appendTo($('.nestedMenu', $(subSubSideListItem)));
							}
						}
						
						// add sub subitem to subitem list
						subSubListItem.appendTo($('ul.subSubItemMenu', $(subListItem)));
						
						
						
					}
				}
				
				// add subitem to root level list
				subListItem.appendTo($('ul.subItemMenu', $(listItem)));
			}
		}
		
		// add item to mobile nav
		listItem.appendTo($('#mobileNavigation > ul'));
	}
	
	$('ul.mobileNavMenu a.hasItems').click(function(e) {
		// dont follow link
		e.preventDefault();
		// grab the submenu
		var parent = $(this).parent('li');
		var subMenu = parent.find('ul:first');
		// toggle the subitem menu
		subMenu.slideToggle('400');
		
		// toggle active / inactive for the menu item
		if (parent.hasClass('active')) {
			parent.removeClass('active');
		} else {
			parent.addClass('active');
		}
	});
	
	// click the mobile nav button
	$('.btnMobileNav').click(function() {
		// show or hide the mobile nav menu
		if ($('#mobileNavigationContainer').is(':visible')) {
			$('#mobileNavigationContainer').hide('slide', {direction: 'left'}, 400);
			$('#bodyOverlay').hide();
			$('body').css('overflow', 'auto');
		} else {
			$('#mobileNavigationContainer').show('slide', {direction: 'left'}, 400);
			$('#bodyOverlay').show();
			$('body').css('overflow', 'hidden');
		}
	});
	
	$('.btnSearch').click(function() {
		$('.searchArea').slideToggle();
	});
	
	// each root level navigation list item
	$('#mainNav > .row > li').each(function() {
		// determine which dropdown to use (left or right)
		var dropdownDirection = "dropdown-left";
		if (i > 2) {
			dropdownDirection = "dropdown-right";
		}
		
		// copy the navigation for desktop view
		// copy new list item
		var listItem = $('#newListItemTemplate').clone();
		// add needed classes
		listItem.addClass('desktopItem dropdown '+ dropdownDirection +' hidden-xs hidden-sm').removeClass('hidden').removeAttr('id');
		// copy html
		listItem.html($(this).html());
		// add to DOM
		listItem.appendTo('#mainNavRow');
		
		// handle drop down menus
		var listItem = $('#newListItemTemplate').clone();
		// remove id
		listItem.removeAttr('id');
		
		listItem.html($(this).html()).removeClass('hidden').addClass('visible-xs col-xs-6');
		
		// only apply a modal if there is a dropdown menu associated with the navigation item
		/*if ($(this).find('.dropdown-menu').length) {
			// apply the modal data styles
			var modalLink = listItem.find('.listItem a');
			listItem.find('.listItem a').attr('data-toggle', 'modal').attr('data-target', '#modal-' + $(this).attr('id'));
			
			// duplicate the modal template to allow a modal for each navigation item
			var modal = $('#newModalTemplate').clone();
			// set modal id
			modal.find('.modal.fade').attr('id', 'modal-' + $(this).attr('id'));
			// set modal body
			modal.find('.modal-body').html($(this).find('.dropdown-menu').html()).wrapInner('<ul></ul>');
			// set modal title
			modal.find('.modal-title').text(modalLink.text());
			// add modal to DOM
			$('#modals').append(modal);
		}*/
		
		listItem.appendTo('#mainNavRow');
		
		// increment the count
		i++;
	});
	
	// quick links on mobile display
	var quickLinks = $('#quick-links-dropdown');
	
	// only apply a modal if there is a dropdown menu associated with the navigation item
	if (quickLinks.find('.dropdown-menu').length) {
		// apply the modal data styles
		var modalLink = quickLinks.find('a.dropdown-toggle');
		
		// duplicate the modal template to allow a modal for each navigation item
		var modal = $('#newModalTemplate').clone();
		// set modal id
		modal.find('.modal.fade').attr('id', 'modal-' + quickLinks.attr('id'));
		// set modal body
		modal.find('.modal-body').html(quickLinks.find('.dropdown-menu').html()).wrapInner('<ul></ul>');
		// set modal title
		modal.find('.modal-title').text(modalLink.text());
		// add modal to DOM
		$('#modals').append(modal);
	}
	
	//listItem.appendTo(quickLinks);
}

// Set the global display size variable
function SetDisplay() {
	if ($('#visibleXS').is(':visible')) {
		Display = "xs";
	} else if ($('#visibleSM').is(':visible')) {
		Display = "sm";
	} else if ($('#visibleMD').is(':visible')) {
		Display = "md";
	} else if ($('#visibleLG').is(':visible')) {
		Display = "lg";
	}
}

// Handle the social icon menu
function HandleSocialMenu() {
	if (Display === "sm") {
		$('#socialList').addClass('dropdown-menu').appendTo('#socialListVertical');
		$('#socialDropdown').dropdown();
	} else {
		$('#socialList').removeClass('dropdown-menu').appendTo('#socialListHorizontal');
	}
}
