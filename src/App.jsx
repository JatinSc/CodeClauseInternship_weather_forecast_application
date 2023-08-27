import React, { useState, useEffect } from 'react'
import axios from 'axios';
import './App.css'
import Loading from './components/Loading';


const App = () => {
  const apiKey = "c13cecf71893f90eebcf3b2b7d3cd7ea";

  const [data, setData] = useState(null);
  const [city, setCity] = useState('');
  const [isDay, setIsDay] = useState(false);
  const [localTime, setLocalTime] = useState("");
  const [localDate, setLocalDate] = useState("");
  const [loading, setLoading] = useState(true)

  const getWeatherData = async (city) => {
    try {
      const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`);
      setData(res.data);
      console.log(res.data); // Log the response data from the API
      //for checking if its day or night in the searched city
      const currentTime = new Date().getTime() / 1000;
      setIsDay(currentTime >= res.data.sys.sunrise && currentTime <= res.data.sys.sunset);

      // Calculate local time based on timezone offset
      const currentTimeUTC = new Date().getTime() / 1000;
      const timezoneOffset = res.data.timezone;
      const localTimeInSeconds = currentTimeUTC + timezoneOffset;
      const localDate = new Date(localTimeInSeconds * 1000);

      const hours = localDate.getUTCHours(); // Get UTC hours
      const minutes = localDate.getUTCMinutes(); // Get UTC minutes
      const amOrPm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = (hours % 12) || 12;
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

      setLocalTime(`${formattedHours}:${formattedMinutes} ${amOrPm}`); // Set local time string
      setLocalDate(localDate.toLocaleDateString()); // Set local time string
      setCity("")
    } catch (error) {
      setData(null)
      console.log(error.message);
    }
  };

  const handelSubmit = async (e) => {
    if (city !== "" && e.key === "Enter") {
      getWeatherData(city);
      setCity("");
    }
  }

  //# for user's exact current location
  const getUserLocation = () => {
    // Get user's geolocation
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        getCurrentLocationWeather(latitude, longitude);
      },
      (error) => {
        console.log(error.message);
        getWeatherData("india")
        setLoading(false); // Done loading even in case of error
        
      }
    );
  }
  const getCurrentLocationWeather = async (latitude, longitude) => {
    try {
      const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`);
      setData(res.data);

      const currentTimeUTC = new Date().getTime() / 1000;
      const timezoneOffset = res.data.timezone;
      const localTimeInSeconds = currentTimeUTC + timezoneOffset;
      const localDateTime = new Date(localTimeInSeconds * 1000);

      const hours = localDateTime.getUTCHours();
      const minutes = localDateTime.getUTCMinutes();
      const amOrPm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = (hours % 12) || 12;
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

      setLocalDate(localDateTime.toLocaleDateString());
      setLocalTime(`${formattedHours}:${formattedMinutes} ${amOrPm}`);
      setLoading(false); // Done loading
    } catch (error) {
      console.log(error.message);
      setLoading(false); // Done loading even in case of error
    }
  };

  useEffect(() => {
    getUserLocation()
  }, []);

  return (
    <div className='main-container' style={{
      backgroundImage: `url(${data ? (isDay ? data.weather[0].main : "Night_" + data.weather[0].main) : "Forest"}.jpg)  `,
      backgroundSize: 'cover', // Adjust this property as needed
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
    }}>
      <div className="container">
        <img className="home" onClick={()=> getUserLocation() } src="home.gif" alt="home button" />
        <h1>Weather Forecast </h1>
        <div className="container-input">
          <input type="text" onKeyDown={handelSubmit} placeholder="Search City...." name="text" value={city} onChange={(e) => setCity(e.target.value)} className="input" />
          <img src="search.svg" alt="search" />
          
        </div>
        
        {
          loading ? <Loading /> : (
            data ? (
              <div>
                <h2>{data.name}, {data.sys.country}</h2>
                <div className='temp'>
                  <img src={`/animated/${isDay ? data.weather[0].main : "Night" + data.weather[0].main}.svg`} alt="temp" />
                  <p>{(data.main.temp - 273.15).toFixed(0)}</p>
                  <span>°c</span>
                  <p className='weather'>{data.weather[0].main}</p>

                </div>
                <div className="lower">
                  <div className='info'>
                    <img src="wind.svg" alt="wind" />
                    <p>Wind</p>
                    <small>{data.wind.speed} km/h</small>
                  </div>
                  <div className='info'>
                    <img src="humidity.svg" alt="humidity" />
                    <p>Humidity</p>
                    <small>{data.main.humidity} %</small>
                  </div>
                  <div className='info'>
                    <img src="feelsLike.svg" alt="d=feelsLike" />
                    <p>Feels Like</p>
                    <small>{(data.main.feels_like - 273.15).toFixed(2)}°C</small>
                  </div>
                  {/* <p>{localTime}</p> */}
                </div>
                <div className='timezone'>
                  <p>
                    {localDate}
                  </p>
                  <p>
                    {localTime}
                  </p>
                </div>
              </div>
            ) : <div className='noData'>
                <Loading/>
                <p>City not Found , please try again.</p>
              </div>
          )
        }

      </div>
      <div className='credits'>
        <p>created by <a href="https://github.com/JatinSc" target='blank' title='github profile'>Jatin.</a></p>
      </div>
    </div>
  );
};

export default App;

