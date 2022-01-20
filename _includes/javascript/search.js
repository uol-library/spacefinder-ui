$().ready(function () {
    $(document).on('click', '.filter-option', function(event) {
        event.preventDefault();
        $(this).toggleClass('active');
        if ( $(this).hasClass('active') ) {
            if ( $(this).hasClass('noise-level') ) {
                $('#search-noise .filter-option').removeClass('active');
                $(this).toggleClass('active');
            }
            if ( $(this).hasClass('work') ) {
                $('#search-work .filter-option').removeClass('active');
                $(this).toggleClass('active');
            }
        }
        if ($('.search-options-container .filter-option.active').length) {
            $('.list-space').each(function(){
                var hidespace = true;
                var space = this;
                $('.search-options-container .filter-option.active').each(function(){
                    if (hidespace) {
                        var activeclass = $(this).data('id');
                        if ($(space).prop('className').indexOf(activeclass) > -1) {
                            hidespace = false;
                        }
                    }
                });
                if (hidespace) {
                    $(space).addClass('hidden');
                } else {
                    $(space).removeClass('hidden');
                }
            });
        } else {
            $('.list-space').removeClass('hidden');
        }
        $('#list').scrollTop(0);
    });
    $(document).on('click', '#clear-search', function(event) {
        event.preventDefault();
        $('.filter-option').removeClass('active');
        $('.list-space').removeClass('hidden');
    });
    $('.search-options-container .header').parents('li').addClass('expanded').end().append(
        $('<a />')
        .append($('<i />').addClass('icon-arrow-down'))
        .addClass('section-collapse')
        .addClass('expanded')
        .on('click', function(event) {
            event.preventDefault();
            if($(this).hasClass('expanded')) {
                $(this).find('i').removeAttr('class').addClass('icon-arrow-up');
                $(this).parents('li').find('>ul:first-of-type').stop().slideUp(300);
            } else {
                $(this).find('i').removeAttr('class').addClass('icon-arrow-down');
                $(this).parents('li').find('>ul:first-of-type').stop().slideDown(300);
            }
            $(this).toggleClass('expanded');
            $(this).parents('li').toggleClass('expanded');
        })
    );
});