import React, { useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { utils } from '../../_helpers/utils';
import { appConstants } from '../../_helpers/consts.js';
import ReactTableFilter from "../_ui/reactTableFilter";
import MTable from "../_ui/materialTable";
import Input from "../_ui/input";
import NavigationBar from '../_navigation/NavigationBar';
import './Home.css';
import { columns } from '../../_columns/parcelsDisplayColumns';
import { Button } from "react-bootstrap";
import DropDown from "../_ui/dropDown";

const isBrowser = typeof window !== `undefined`

const Home = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [searchString, setSearchString] = useState("");
    const state = useRef(null);
    const county = useRef(null);
    const municipality = useRef(null);
    const status = useRef(null);
    const [distinctFilters, setDistinctFilters] = useState(null);

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            navigate("/");
        }
        utils.getDistinctFilters()
            .then((data) => {
                setDistinctFilters(data);
            })
    }, []);

    const handleSearch = (e) => {
        var response_status = 0;
        var url = appConstants.BASE_URL.concat(appConstants.SEARCH_PARCEL).concat(searchString);
        fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                'x-access-token': localStorage.getItem('token')
            },
        })
            .then((res) => {
                if (res.status === 200) {
                    response_status = 200;
                    return res.json();
                }
                else {
                    response_status = 400;
                    return res.json();
                }
            })
            .then((data) => {
                if (response_status === 200) {
                    setData(data);
                } else {
                    alert(data.message);
                }
            })
            .catch((err) => console.error(err));
    }

    const handleFilterSearch = (e) => {
        if (state.current || county.current || municipality.current || status.current) {
            var response_status = 0;
            var url = appConstants.BASE_URL.concat(appConstants.GET_PARCELS_BASED_ON_FILTERS);
            var params = [];
            if (state.current) {
                params.push(`state=${state.current}`);
            }
            if (county.current) {
                params.push(`county=${county.current}`);
            }
            if (municipality.current) {
                params.push(`municipality=${municipality.current}`);
            }
            if (status.current) {
                params.push(`status=${status.current}`);
            }
            url = url.concat(params.join('&'));
            fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    'x-access-token': localStorage.getItem('token')
                },
            })
                .then((res) => {
                    if (res.status === 200) {
                        response_status = 200;
                        return res.json();
                    }
                    else {
                        response_status = 400;
                        return res.json();
                    }
                })
                .then((data) => {
                    if (response_status === 200) {
                        setData(data);
                    } else {
                        alert(data.message);
                    }
                })
                .catch((err) => console.error(err));
        }
    }

    const handleClear = (e) => {
        setSearchString("");
        state.current = null;
        county.current = null;
        municipality.current = null;
        status.current = null;
        setData([]);
    }

    const render = () => {
        return (
            <div>
                <NavigationBar />

                <div className='container mt-3 d-flex'>
                    <div className="col col-lg-5"><Input text="Search" type="text"
                        value={searchString} onChange={(e) => setSearchString(e)}
                        clearbutton={true} onClear = {() => handleClear()}/>
                    </div>
                    <Button className="ml-2" variant="primary" onClick={(e) => handleSearch()}> Search </Button>
                </div>
                {
                    distinctFilters ?
                        <div className='container mt-3'>
                            <div className="d-flex justify-content-left">
                                <div className="col col-lg-2"><DropDown placeholder={'State'} list={distinctFilters.states} isMulti={false} prepareArray={true} onSelect={(e) => { state.current = e.value; handleFilterSearch() }} /></div>
                                <div className="col col-lg-2"><DropDown placeholder={'County'} list={distinctFilters.counties} isMulti={false} prepareArray={true} onSelect={(e) => { county.current = e.value; handleFilterSearch() }} /></div>
                                <div className="col col-lg-2"><DropDown placeholder={'Municipality'} list={distinctFilters.municipalities} isMulti={false} prepareArray={true} onSelect={(e) => { municipality.current = e.value; handleFilterSearch() }} /></div>
                                <div className="col col-lg-2"><DropDown placeholder={'Status'} list={utils.statusArray()} isMulti={false} prepareArray={false} onSelect={(e) => { status.current = e.value; handleFilterSearch() }} /></div>
                            </div>
                        </div>
                        :
                        null
                }
                <hr className='container mt-3 d-flex' />


                {/* Material Table */}
                <div className='p-3'>
                    {
                        data.length > 0 ?
                            <MTable
                                title="Parcels"
                                data={data}
                                columns={columns}
                                pageSize={10}
                                filtering={true}
                                selection={false}
                                showTitle={true}
                                cellEdit={false}
                                rowEdit={false}
                                tableLayout='Fixed'
                                columnsButton={true}
                                onDownloadButtonPressed={(data) => { utils.exportCSV(data) }}
                            />
                            :
                            null
                    }
                </div>

            </div>
        );
    }

    return (
        render()
    );
};

export default Home;