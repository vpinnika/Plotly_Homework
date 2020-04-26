function buildMetadata(sample) {
    d3.json("data/samples.json").then((data) => {
        var metadata = data.metadata;
        // Filter the data for the object with the desired sample number
        var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
        var result = resultArray[0];
        // Use d3 to select the panel with id of `#sample-metadata`
        var PANEL = d3.select("#sample-metadata");

        // Use `.html("") to clear any existing metadata
        PANEL.html("");

        Object.entries(result).forEach( entry => PANEL.append('p').text(`${entry[0]}: ${entry[1]}`));

        // Spedometer type gauge
        var gauge_data = [ {
            domain: {x: [0,1], y:[0,1]},
            gauge: { axis: { range: [null, 9] },
            steps: [
             { range: [0, 1], color: "Beige" },
             { range: [1, 2], color: "AntiqueWhite" },
             { range: [2, 3], color: "Khaki" },
             { range: [3, 4], color: "Khaki" },
             { range: [4, 5], color: "GreenYellow" },
             { range: [5, 6], color: "GreenYellow" },
             { range: [6, 7], color: "LawnGreen" },
             { range: [7, 8], color: "LawnGreen" },
             { range: [8, 9], color: "LimeGreen" },
           ]},       
            value: result.wfreq,
            title: { text: `Belly Botton Washing Frequency: Scrubs per week` },
            type: "indicator",
            mode: "gauge+number"
            } ];
        let gauge_layout = { width: 600, height: 500, margin: {t:0, b:0}};
        Plotly.newPlot('gauge', gauge_data, gauge_layout);

    });
}



function buildCharts(sample) {
    // console.log(`sample: ${sample}`)
    d3.json("data/samples.json").then((data) => {
        // 1. Create the main horizontal bar chart.
        var samples = data.samples; // samples is the array of results on all samples.
        var resultArray = samples.filter(sampleObj => sampleObj.id == sample);
        var result = resultArray[0];                                     
    
        // Todo: Instead of just grabbing the first 10, get those
        // with the highest frequency in the population.
        let otu_array = result.otu_ids.slice(0,10).map(item => `OTU  ${item}`).reverse();
        let otu_labels = result.otu_labels.slice(0,10).reverse();
        let otu_values = result.sample_values.slice(0,10).reverse();

        var hbar_chart_data = [{
            type:'bar',
            x: otu_values,
            y: otu_array,
            text: otu_labels,
            orientation: 'h'
        }]

        Plotly.newPlot("bar", hbar_chart_data);

        // 2. Create the scatter plot

        let trace1 = {
            x: result.otu_ids,
            y: result.sample_values,
            mode: 'markers',
            type: 'scatter',
            text: result.otu_ids.map(id => `OTU #${id}`),
            marker: {
                color: result.otu_ids,
                colorscale: 'Earth',               
                size: result.sample_values.map(v => parseFloat(v)*0.75)
            }
        };

        let bubble_data = [trace1];

        var layout =  {
            xaxis: {
                title: {
                text: 'OTU ID'
                        }
          },
        };
        
        Plotly.newPlot("bubble", bubble_data,layout);

    });
}

function init() {
    // Grab a reference to the dropdown select element
    var selector = d3.select("#selDataset");

    // Use the list of sample names to populate the select options
    d3.json("data/samples.json").then((data) => {
        var sampleNames = data.names;

        sampleNames.forEach((sample) => {
            selector
                .append("option")
                .text(sample)
                .property("value", sample);
        });

        // Use the first sample from the list to build the initial plots
        var firstSample = sampleNames[0];
        buildCharts(firstSample);
        buildMetadata(firstSample);
    });
}

function optionChanged(newSample) {
    // Fetch new data each time a new sample is selected
    buildCharts(newSample);
    buildMetadata(newSample);
}

// Initialize the dashboard
init();
