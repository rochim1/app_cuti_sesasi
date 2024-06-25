const fs = require('fs');

const exportTemplateApotik = async (req, res) => {
    let { delimiter } = req.params;
    const headers = [
        'Kode_Apotik',
        'Nama',
        'Alamat',
        'NoTelp',
        'KodeWilayah',
        'Kelurahan',
        'Kota',
        'Kabupaten',
        'Provinsi',
        'KodePetugas',
        'Longitude',
        'Latitude',
        'Email',
        'NPWP',
        'NPPKP',
        'pbf_id',
        'NoSIPA',
        'NoIjin',
        'BlackList'
    ]
    const filename = 'static/template/dataApotik.csv';
    delimiter = delimiter === 'tab' ? '\t' : delimiter;
    let finalString = `${headers.join(`${delimiter}`)}\n`;
    fs.writeFileSync(filename, finalString, { encoding: 'binary' });

    return res.download(filename, () => {
        fs.unlinkSync(filename)
    })
}

const exportTemplateUser = async (req, res) => {
    let { delimiter } = req.params;
    const headers = [
        'Timestamp',
        'email',	
        'name',	
        'email_input',	
        'no_identitas',	
        'identity_type',	
        'gender (f/m)',	
        'divisi_name',	
        'address',	
        'domisili',	
        'pos_code',	
        'date_of_birth',
        'date_join'
    ]
    const filename = 'static/template/dataUser.csv';
    delimiter = delimiter === 'tab' ? '\t' : delimiter;
    let finalString = `${headers.join(`${delimiter}`)}\n`;
    fs.writeFileSync(filename, finalString, { encoding: 'binary' });

    return res.download(filename, () => {
        fs.unlinkSync(filename)
    })
}

module.exports = {
    exportTemplateApotik,
    exportTemplateUser
}