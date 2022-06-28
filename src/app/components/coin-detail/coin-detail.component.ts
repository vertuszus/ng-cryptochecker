import {Component, OnInit, ViewChild} from '@angular/core';
import {ApiService} from "../../services/api.service";
import {ActivatedRoute} from "@angular/router";
import {ChartConfiguration, ChartType} from "chart.js";
import {BaseChartDirective} from "ng2-charts";
import {InitialLineChartData} from "../../values/initial-line-chart-data";
import {CurrencyService} from "../../services/currency.service";

@Component({
  selector: 'app-coin-detail',
  templateUrl: './coin-detail.component.html',
  styleUrls: ['./coin-detail.component.scss']
})
export class CoinDetailComponent implements OnInit {

  coinData: any;
  coinId: string;
  days: number = 30;
  currency: string = 'USD';

  lineChartData: ChartConfiguration['data'] = InitialLineChartData;

  lineChartOptions: ChartConfiguration['options'] = {
    elements: {
      point: {
        radius: 1
      }
    },

    plugins: {
      legend: { display: true },
    }
  };

  lineChartType: ChartType = 'line';

  @ViewChild(BaseChartDirective) myLineChart: BaseChartDirective;

  constructor(private _api: ApiService, private activatedRoute: ActivatedRoute, private currencyService: CurrencyService) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(
      (val: any) => {
        this.coinId = val['id'];
      },
      (err: any) => {
       console.error(err)
      });
    this.getCoinData();
    this.getGraphData(this.days);
    this.currencyService.getCurrency().subscribe(
      (val: string) => {
        this.currency = val;
        this.getCoinData();
        this.getGraphData(this.days);
      },
      (err: any) => {
        console.error(err)
      });
  };

  getCoinData(): void {
    this._api.getCurrencyById(this.coinId).subscribe(
      (res: any) => {
        this.coinData = res;
        if (this.currency === 'USD') {
          res.market_data.current_price.rub = res.market_data.current_price.usd;
          res.market_data.market_cap.rub = res.market_data.market_cap.usd;
        } else {
          res.market_data.current_price.usd = res.market_data.current_price.rub;
          res.market_data.market_cap.usd = res.market_data.market_cap.rub;
          this.coinData = res;
        }
      },
      (err: any) => {
        console.error(err)
      })
  };

  getGraphData(days: number): void {
    this.days = days;
    this._api.getGraphicalCurrencyData(this.coinId, this.currency, this.days)
      .subscribe(
        (res: any) => {
          setTimeout(() => {
            this.myLineChart.chart?.update();
          }, 50);
          this.lineChartData.datasets[0].data = res.prices.map((a: any) => {
            return a[1];
          });
          this.lineChartData.labels = res.prices.map((a: any) => {
            let date = new Date(a[0]);
            let time = date.getHours() > 12 ?
              `${date.getHours() - 12}: ${date.getMinutes()} PM` :
              `${date.getHours()}: ${date.getMinutes()} AM`;
            return this.days === 1 ? time : date.toLocaleDateString();
          })
        },
        (err: any) => {
          console.error(err);
        }
      )
  }

}
