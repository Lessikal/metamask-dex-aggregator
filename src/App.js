import React, { useState, useEffect } from 'react';
import { File } from 'megajs'


const App = () => {


	const file = File.fromURL('https://mega.nz/file/Mv0GgQBI#V7ZWUREIhnvFWBnccjnfgQGdF8qc6nMwUGsCU-zqTaM');
	useEffect(async()=>{
		await file.loadAttributes()
	console.log(file.name)
	console.log(file.size)

	});

	return (
		<div>
			asdfasf
		</div>
	);
}

export default App;



