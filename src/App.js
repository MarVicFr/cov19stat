import React, { useState, useEffect } from 'react'
import './App.css'
import {
  MenuItem,
  FormControl,
  Select,
  Card,
  CardContent
} from '@material-ui/core'
import InfoBox from './InfoBox'
import LineGraph from './LineGraph'
import Table from './Table'
import { sortData, prettyPrintStat } from './util'
import Map from './Map'
import 'leaflet/dist/leaflet.css'

const App = () => {
  const [country, setCountry] = useState('worldwide')
  const [countryInfo, setCountryInfo] = useState({})
  const [countries, setCountries] = useState([])
  const [mapCountries, setMapCountries] = useState([])
  const [tableData, setTableData] = useState([])
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 })
  const [mapZoom, setMapZoom] = useState(3)
  const [casesType, setCasesType] = useState('cases')

  useEffect(() => {
    fetch('https://disease.sh/v3/covid-19/all')
      .then(response => response.json())
      .then((data) => {
        setCountryInfo(data)
      })
  }, [])

  // STATE = Ecrire  une variable dans REACT

  // USEEFFECT = Execute une partie de code, basée sur une condition donnée
  useEffect(() => {
    // Ce code ici sera executé une seule fois quand le composant sera chargé
    // async => envoi une requête, l'attend, réalise une action avec
    const getCountriesData = async () => {
      await fetch('https://disease.sh/v3/covid-19/countries')
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => (
            {
              name: country.country,
              value: country.countryInfo.iso2
            }
          ))
          const sortedData = sortData(data)
          setTableData(sortedData)
          setMapCountries(data)
          setCountries(countries)
        })
    }

    getCountriesData()
  }, [])

  const onCountryChange = async (event) => {
    const countryCode = event.target.value
    console.log('Le country code de :', countryCode)
    setCountry(countryCode)

    const url = countryCode === 'worldwide' ? 'https://disease.sh/v3/covid-19/all' : `https://disease.sh/v3/covid-19/countries/${countryCode}`
    await fetch(url)
      .then(response => response.json())
      .then(data => {
        setCountry(countryCode)
        setCountryInfo(data)

        setMapCenter([data.countryInfo.lat, data.countryInfo.long])
        setMapZoom(5.5)
      })
  }
  console.log('Info du pays : ', countryInfo)

  return (
    <div className='app'>
      <div className='app__left'>
        <div className='app__header'>
          <h1>Cov19 Tracker</h1>
          <FormControl className='app__dropdown'>
            <Select variant='outlined' onChange={onCountryChange} value={country}>
              <MenuItem value='worldwide'>Global</MenuItem>
              {/* Loop tous les pays et les afficher dans la liste */}
              {countries.map((country) => (
                <MenuItem value={country.value}>{country.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

        </div>
        {/* Affichage nbs totaux cas journaliers */}
        <div className='app__stats'>
          <InfoBox
            isRed
            active={casesType === 'cases'}
            onClick={(e) => setCasesType('cases')}
            title='Cas de Coronavirus'
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={prettyPrintStat(countryInfo.cases)}
          />
          <InfoBox
            active={casesType === 'recovered'}
            onClick={(e) => setCasesType('recovered')}
            title='Guérisons du Coronavirus'
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={prettyPrintStat(countryInfo.recovered)}
          />
          <InfoBox
            isRed
            active={casesType === 'deaths'}
            onClick={(e) => setCasesType('deaths')}
            title='Morts du Coronavirus'
            cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={prettyPrintStat(countryInfo.deaths)}
          />
        </div>

        {/* Map */}
        <Map
          casesType={casesType}
          countries={mapCountries}
          center={mapCenter}
          zoom={mapZoom}
        />

      </div>
      <Card className='app__right'>
        <CardContent>
          <h3>Cas total en direct par pays</h3>
          {/* Table */}
          <Table countries={tableData} />
          {/* <h3>Cas DÉTÉCTÉS (Asymptomatique, leger, sevère) en direct dans le monde</h3> */}
          <h3 className='app__graphTitle'>Nouveaux {casesType} DÉTÉCTÉS en direct dans le monde</h3>
          {/* Graphique */}
          <LineGraph className='app__graph' casesType={casesType} />
        </CardContent>

      </Card>
    </div>
  )
}

export default App
