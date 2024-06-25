const moment = require('moment');
const common = require('../../utils/common');
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;
const translationJSON = require('../../utils/translate/translationJSON.json');
const UserModel = require('../users/user.model');

const generateAggregateQuery = (sorting, filter, pagination, ctx) => {
  let aggregateQuery = [];
  let aggregateQueryFilter = {
    status: filter && filter.status ? filter.status : 'active',
    instansi_id: ctx.user.instansi_id
  }
  let sortingQuery = {
    updatedAt: -1
  };

  if (filter) {
    if (filter.nama_kategori_cuti) {
      aggregateQueryFilter.nama_kategori_cuti = common.createDiacriticSensitiveRegex(filter.nama_kategori_cuti)
    }
    if (filter.tipe) {
      aggregateQueryFilter.tipe = filter.tipe
    }
    if (filter.jumlah_kuota_hari) {
      aggregateQueryFilter.jumlah_kuota_hari = filter.jumlah_kuota_hari
    }
  }

  if (sorting) {
    if (sorting.nama_kategori_cuti) {
      sortingQuery = {
        nama_kategori_cuti: sorting.nama_kategori_cuti == "asc" ? 1 : -1
      }
    }
    if (sorting.jumlah_kuota_hari) {
      sortingQuery = {
        jumlah_kuota_hari: sorting.jumlah_kuota_hari == "asc" ? 1 : -1
      }
    }
    if (sorting.sugested_day_off) {
      sortingQuery = {
        sugested_day_off: sorting.sugested_day_off == "asc" ? 1 : -1
      }
    }
    if (sorting.allow_half_day) {
      sortingQuery = {
        allow_half_day: sorting.allow_half_day == "asc" ? 1 : -1
      }
    }
  }

  aggregateQuery.push({
    $match: aggregateQueryFilter
  }, {
    $sort: sortingQuery
  });
  
  if (filter && filter.get_only_ids) {
    aggregateQuery.push({
      $project: {
        _id: 1
      }
    }, {
      $group: {
        _id: null,
        ids: {
          $push: '$_id'
        } // Push all _id values into an array
      }
    }, {
      $project: {
        _id: 0,
        ids: 1 // Output just the array of _id values
      }
    })

    return { aggregateQuery }
  }

  let paginationQuery = [];
  if (pagination) {
    let skip = pagination.limit * pagination.page;
    paginationQuery.push({
      $skip: skip,
    }, {
      $limit: pagination.limit,
    });
  }

  aggregateQuery.push({
    $facet: {
      kategoriCuti: paginationQuery,
      info_page: [{
        $group: {
          _id: null,
          count: {
            $sum: 1
          }
        },
      }, ],
    },
  });

  return { aggregateQuery }
}

const generateAggregateQueryExport = (kategoriCuti_ids) => {
  let aggregateQuery = [];
  let aggregateQueryFilter = {
    status: {
      $ne: 'deleted'
    },
    _id: {
      $in: kategoriCuti_ids.map(id => new ObjectId(id))
    }
  }

  aggregateQuery.push({
    $match: aggregateQueryFilter
  });

  return { aggregateQuery }
}


const kategoriCutiMapping = async (data) => {
  
  let dataUser = {};
  if (data.user_created) {
    dataUser = await UserModel.findOne({ _id: new ObjectId(data.user_created) }).lean();
  }
  
  let nama_user = dataUser && dataUser.name ? dataUser.name : '-'; 

  let tipe;
  if (data.tipe) {
    tipe = translationJSON.dayoff_type.ind[data.tipe.toUpperCase()]
  }

  let jumlah_kuota_hari;
  if (data.jumlah_kuota_hari) {
    jumlah_kuota_hari = `${data.jumlah_kuota_hari} hari`
  }

  let sugested_day_off;
  if (data.sugested_day_off) {
    sugested_day_off = `${data.sugested_day_off} hari`
  }

  let number_of_exceed;
  if (data.number_of_exceed) {
    number_of_exceed = `${data.number_of_exceed} hari`
  }

  return {
    ...data,
    tipe,
    jumlah_kuota_hari,
    sugested_day_off,
    number_of_exceed,
    nama_user
  };
}

module.exports = {
  generateAggregateQuery,
  generateAggregateQueryExport,
  kategoriCutiMapping
}