import React, { useState } from "react";
import { utils } from '../../_helpers/utils';
import { appConstants } from '../../_helpers/consts.js';

const SingleFileUploader = (props) => {
    const [file, setFile] = useState(null);

    const handleFileChange = (e) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
            const data = new FormData();
            data.append('file', e.target.files[0], e.target.files[0].name);
            props.onClick(data)
        }
    };

    return (
        <>
            <div>
                <label htmlFor="file" className="sr-only">
                    Choose a file
                </label>
                <input id="file" type="file" name="file" onChange={handleFileChange} />
            </div>
            {file && (
                <section>
                    File details:
                    <ul>
                        <li>Name: {file.name}</li>
                        <li>Type: {file.type}</li>
                        <li>Size: {file.size} bytes</li>
                    </ul>
                </section>
            )}

            {/* {file && <button className="btn btn-success mt-3" onClick={handleUpload}>Upload a file</button>} */}
        </>
    );
};

export default SingleFileUploader;