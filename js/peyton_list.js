
var peyton_list_latest_clicked;

// sort by Turkish and some other language special letters
jQuery.extend(jQuery.fn.dataTableExt.oSort, {
  "turkish-pre": function ( a ) {
    var special_letters = {
      "C": "ca", "c": "ca", "Ç": "cb", "ç": "cb",
      "G": "ga", "g": "ga", "Ğ": "gb", "ğ": "gb",
      "I": "ia", "ı": "ia", "İ": "ib", "i": "ib",
      "O": "oa", "o": "oa", "Ö": "ob", "ö": "ob",
      "S": "sa", "s": "sa", "Ş": "sb", "ş": "sb",
      "U": "ua", "u": "ua", "Ü": "ub", "ü": "ub",
      "A": "aa", "a": "aa", "Ä": "ab", "ä": "ab"
    };

    for (var val in special_letters) {
      a = a.split(val).join(special_letters[val]).toLowerCase();
    }

    return a;
  },

  "turkish-asc": function (a, b) {
    return ((a < b) ? -1 : ((a > b) ? 1 : 0));
  },

  "turkish-desc": function (a, b) {
    return ((a < b) ? 1 : ((a > b) ? -1 : 0));
  }
});


function peyton_list_format_peyton_list_table_form(row) {
  var d = row.data();
  var row_index = row.index();

  var ret = '' +
    '<div class="peyton_list_inner_update">' +
      '<form id="peyton_list_inner_update_form" name="peyton_list_inner_update" method="post">' +
        '<input type="hidden" name="id" value="' + d.id + '" />' +
        '<table id="peyton_list_inner_update_table">' +
          '<tr>' +
            '<td><label for="title">' + peyton_list_dt_str['form_title'] + '</label></td>' +
            '<td><input type="text" name="title" size="50" required="true" value="' + d.title + '" /></td>' +
          '</tr>' +
          '<tr>' +
            '<td><label for="category">' + peyton_list_dt_str['form_category'] + '</label></td>' +
            '<td>' +
              '<select name="category">';

  jQuery.each(peyton_list_category, function(value, name) {
    var selected = '';

    if (d.category == value) {
      selected = 'selected="selected"';
    }

    ret += '<option value="' + value + '" ' + selected + '>' + name + '</option>';
  });

  ret +=      '</select>' +
            '</td>' +
          '</tr>' +
          '<tr>' +
            '<td><label for="status">' + peyton_list_dt_str['form_status'] + '</label></td>' +
            '<td>' +
              '<select name="status">';

  jQuery.each(peyton_list_status_editor, function(value, name) {
    var selected = '';

    if (d.status == value) {
      selected = 'selected="selected"';
    }

    ret += '<option value="' + value + '" ' + selected + '>' + name + '</option>';
  });

  ret +=      '</select>' +
            '</td>' +
          '</tr>' +
          '<tr>' +
            '<td><label for="link">' + peyton_list_dt_str['form_link'] + '</label></td>' +
            '<td><input type="text" name="link" size="50" value="' + d.link + '" /></td>' +
          '</tr>';

  jQuery.each(['created_by_humanized', 'created_at', 'updated_by_humanized', 'updated_at'], function(ix, k) {
    ret += '<tr>' +
             '<td><label for="' + k + '">' + peyton_list_dt_str['form_' + k] + '</label></td>' +
             '<td>' + d[k] + '</td>' +
           '</tr>';
  });

  ret +=  '<tr>' +
            '<td><input type="submit" name="peyton_list_inner_update_delete" data-row_index="' + row_index + '" value="' + peyton_list_dt_str['form_delete'] + '"/></td>' +
            '<td><input type="submit" name="peyton_list_inner_update_update" data-row_index="' + row_index + '" value="' + peyton_list_dt_str['form_update'] + '"/></td>' +
          '</tr>' +
        '</table>' +
      '</form>' +
    '</div>';

  return ret;
}

function initialize_peyton_list() {
  if (jQuery('table#peyton_list_main_list').length === 0) {
    return;
  }

  // add external filter
  jQuery.fn.dataTable.ext.search.push(
    function(settings, data, dataIndex) {
      var category_matching =  true;
      var status_matching = true;
      var category_val = jQuery('select[name=peyton_list_main_list_selector_category]').val();
      var status_val = jQuery('select[name=peyton_list_main_list_selector_status]').val();

      if (category_val !== '0') {
        category_matching = category_val === data[3];
      }

      if (status_val !== '0') {
        status_matching = status_val === data[5];
      }

      return (category_matching && status_matching);
    }
  );

  peyton_list_table = jQuery('table#peyton_list_main_list').DataTable({
    iDisplayLength: 100,
    lengthMenu: [[20, 50, 100, 250, -1], [20, 50, 100, 250, peyton_list_dt_str.all]],
    bPaginate: true,
    bSearchable: true,
    order: [[2, 'asc']],
    aaSorting: [],
    columns: [
      {
        data: null,
        defaultContent: peyton_list_default_edit_str,
        // width: "5%",
        orderable: false,
        class: "peyton_list_table_edit",
      },
      {
        data: "title",
        sType: "turkish",
        visible: false
      },
      {
        data: "title_humanized",
        // width: "55%",
        orderData: 1
      },
      {
        data: "category",
        visible: false
      },
      {
        data: "category_humanized",
        // className: "dt-justified",
        // width: "25%",
        render: function(data, type, row, meta) {
          // return '<a href="' + row.link + '" class="' + peyton_list_category_color[row.category] + '">' + data + '</a>';
          return '<span class="' + peyton_list_category_color[row.category] + '">' + data + '</span>';
        }
      },
      {
        data: "status",
        visible: false
      },
      {
        data: "status_image",
        // width: "15%",
        orderData: 5,
        render: function(data, type, row, meta) {
          return '<img src="/wp-content/plugins/peyton_list/images/' + peyton_list_status_image[row.status] + '"' +
            'class="peyton_list_status_image" title="' + peyton_list_status[row.status] + '" />';
        }
      }
    ],
    language: {
      search: '',
      lengthMenu: "_MENU_",
      emptyTable: peyton_list_dt_str['empty_table'],
      zeroRecords: peyton_list_dt_str['empty_table'],
      info: peyton_list_dt_str['info'],
      infoEmpty: '',
      infoFiltered: '',
      paginate: {
        first: peyton_list_dt_str['first'],
        last: peyton_list_dt_str['last'],
        next: peyton_list_dt_str['next'],
        previous: peyton_list_dt_str['previous']
      }
    },
    fnCreatedRow: function(nRow, aData, iDataIndex) {
      // console.log(aData);
      if (aData['can_edit']) {
        jQuery(nRow).children('td.peyton_list_table_edit').addClass('peyton_list_can_edit');
      }
    }
  });

  jQuery('.dataTables_filter input').attr("placeholder", peyton_list_dt_str.search);
  peyton_list_table.rows.add(peyton_list_dt_data).columns.adjust().draw();

  if (peyton_list_user_has_permission) {
    jQuery('a#peyton_list_toggle_link_form').on('click', function() {
      var add_entry_form_wrapper = jQuery('#peyton_list_add_entry_wrapper');
      var toggle_button = jQuery('a#peyton_list_toggle_link_form');

      if (toggle_button.hasClass('active')) {
        // add_entry_form_wrapper.fadeOut();
        add_entry_form_wrapper.slideUp();
        toggle_button.removeClass('active');

      } else {
        // add_entry_form_wrapper.fadeIn();
        add_entry_form_wrapper.slideDown();
        toggle_button.addClass('active');
      }

      return false;
    });
  }

  peyton_list_table.on('click', 'td.peyton_list_table_edit.peyton_list_can_edit', function() {
    var tr = jQuery(this).closest('tr');
    var td = jQuery(this);
    var row = peyton_list_table.row(tr);

    if (row.child.isShown()) {
      jQuery('div.peyton_list_inner_update', row.child()).slideUp(function () {
        row.child.hide();
        // tr.removeClass('shown');
        td.removeClass('shown');
        td.html(peyton_list_default_edit_str);
      });
    } else {
      row.child(peyton_list_format_peyton_list_table_form(row), 'no_padding').show();
      // tr.addClass('shown');
      td.addClass('shown');
      td.html("-");

      jQuery('div.peyton_list_inner_update', row.child()).slideDown();
    }
  });

  peyton_list_table.on('click', 'input[name=peyton_list_inner_update_update], input[name=peyton_list_inner_update_delete]', function() {
    var current = jQuery(this);
    peyton_list_latest_clicked = current;
    var row_index = current.data('row_index');
    var row = peyton_list_table.row(row_index);
    var tr = jQuery(row.node());
    var td = jQuery(tr.find('td.shown'));
    var form = current.closest('form');
    var form_data = form.serializeArray();
    var ajax_data = {
      action: 'peyton_list',
      entry: {}
    };
    var failed_str;
    var is_update = current.attr('name') === 'peyton_list_inner_update_update';

    jQuery.each(form_data, function(ix, k) {
      ajax_data.entry[k.name] = k.value;
    });

    if (is_update) {
      ajax_data.peyton_list_action = 'update';
      failed_str = peyton_list_dt_str['update_failed'];
    } else {
      ajax_data.peyton_list_action = 'delete';
      failed_str = peyton_list_dt_str['delete_failed'];
    }

    jQuery.ajax({
      url: peyton_list_ajax_url,
      type: 'post',
      dataType: 'json',
      data: ajax_data,
      success: function(data) {
        if (typeof data !== 'undefined') {
          if (data.success) {
            if (row.child.isShown()) {
              jQuery('div.peyton_list_inner_update', row.child()).slideUp(function () {
                row.child.hide();
                td.removeClass('shown');
                td.html(peyton_list_default_edit_str);
              });
            }

            if (is_update) {
              row.data(data.data).draw(false);
            } else {
              row.remove().draw(false);
            }
          } else {
            alert(failed_str);
          }
        }
      },
      error: function(message) {
        console.log(message);
        alert(peyton_list_dt_str['connection_problem']);
      }
    });

    return false;
  });

  jQuery('select[name=peyton_list_main_list_selector_category], ' +
         'select[name=peyton_list_main_list_selector_status]').on('change', function(k) {

    peyton_list_table.columns.adjust().draw();
  });

  if (peyton_list_open_insert_form) {
    jQuery('a#peyton_list_toggle_link_form').click();
  }
}

jQuery(document).ready(function() {
  initialize_peyton_list();
});

